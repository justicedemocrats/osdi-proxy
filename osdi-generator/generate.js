const express = require('express')
const debug = require('debug')
const handleError = require('./utils/handle-error')
const paginate = require('./utils/paginate')
const controller = require('./controller')
const halify = require('./utils/halify')

module.exports = (client, config) => {
  if (!config)
    throw new Error('Must initialize osdi express with a config object before generating routes')

  const log = debug(`${config.route}:${resource}`)
  const app = express()

  log('Initializing %s...', resource)

  app.get('/', paginate, (req, res) => {
    log('GET /')

    client.findAll(req.query)
    .then(result => res.json(halify.collection(resource, req, result)))
    .catch(handleError(res))
  })

  app.get('/:id', (req, res) => {
    log('GET /%s', req.params.id)

    client.one(req.params.id)
    .then(result => res.json(halify.object(resource, req, result)))
    .catch(handleError(res))
  })

  app.post('/', (req, res) => {
    log('POST /')

    client.create(req.body)
    .then(result => res.json(halify.object(resource, req, result)))
    .catch(handleError(res))
  })

  app.put('/:id', (req, res) => {
    log('PUT /%s', req.params.id)

    client.edit(req.body)
    .then(result => res.json(halify.object(resource, req, result)))
    .catch(handleError(res))
  })

  app.delete('/:id', restrict, (req, res) => {
    log('DELETE /%s', req.params.id)

    client.delete(req.params.id)
    .then(numDeleted => res.json({notice: `${numDeleted} rows were deleted`}))
    .catch(handleError(res))
  })

  // config.resources[resource].linkedResources.forEach(l => {
  //   const linked = config.resources[l]
  //
  //   const linkedController = controller({
  //     config,
  //     resource: l,
  //     validate: linked.validate,
  //     Model: linked.Model,
  //     linkedResources: linked.linkedResources,
  //     querify: req => Object.assign(linked.querify(req), {
  //         // [singular + 'Uuid']: req.params.id
  //       }),
  //   })
  //
  //   app.get(`/:id/${l}`, paginate, (req, res) => {
  //     log('GET /%s/%s', req.params.id, l)
  //
  //     linkedController.all(req)
  //     .then(result => res.json(halify.collection(l, req, result)))
  //     .catch(handleError(res))
  //   })
  // })

  return app
}
