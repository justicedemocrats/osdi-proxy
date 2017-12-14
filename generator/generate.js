const express = require('express')
const debug = require('debug')
const handleError = require('./utils/handle-error')
const paginate = require('./utils/paginate')
const binder = require('./utils/binder')
const controller = require('./controller')
const halify = require('./utils/halify')

module.exports = (resource, config) => {
  const {
    Model, singular, linkedResources, querify, restrict, validate
  } = config.resources[resource]

  if (!config)
    throw new Error('Must initialize osdi express with a config object before generating routes')

  const log = debug(`${config.namespace}:osdi:${resource}`)
  const app = express()

  log('Initializing %s...', resource)

  const db = controller({resource, Model, linkedResources, querify, config, validate})

  app.get('/', binder(restrict, 'attributes'), paginate, (req, res) => {
    log('GET /')

    db.all(req)
    .then(result => res.json(halify.collection(resource, req, result)))
    .catch(handleError(res))
  })

  app.get('/:id', binder(restrict, 'attributes'), (req, res) => {
    log('GET /%s', req.params.id)

    db.one(req)
    .then(result => res.json(halify.object(resource, req, result.dataValues)))
    .catch(handleError(res))
  })

  app.post('/', binder(restrict, 'attributes'),  (req, res) => {
    log('POST /')

    db.create(req)
    .then(result => res.json(halify.object(resource, req, result.dataValues)))
    .catch(handleError(res))
  })

  app.put('/:id', binder(restrict, 'attributes'), (req, res) => {
    log('PUT /%s', req.params.id)

    db.edit(req)
    .then(result => res.json(halify.object(resource, req, result.dataValues)))
    .catch(handleError(res))
  })

  app.delete('/:id', restrict, (req, res) => {
    log('DELETE /%s', req.params.id)

    db.remove(req)
    .then(numDeleted => res.json({notice: `${numDeleted} rows were deleted`}))
    .catch(handleError(res))
  })

  config.resources[resource].linkedResources.forEach(l => {
    const linked = config.resources[l]

    const linkedController = controller({
      config,
      resource: l,
      validate: linked.validate,
      Model: linked.Model,
      linkedResources: linked.linkedResources,
      querify: req => Object.assign(linked.querify(req), {
          // [singular + 'Uuid']: req.params.id
        }),
    })

    app.get(`/:id/${l}`, binder(restrict, 'attributes'), paginate, (req, res) => {
      log('GET /%s/%s', req.params.id, l)

      linkedController.all(req)
      .then(result => res.json(halify.collection(l, req, result)))
      .catch(handleError(res))
    })
  })

  return app
}
