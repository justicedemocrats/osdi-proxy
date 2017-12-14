module.exports = ({resource, Model, linkedResources, querify, config, validate}) => {
  const e = {}

  /*
   * Controller for GET /
   */
  e.all = (req) => new Promise((resolve, reject) => {
    const where = querify(req)

    const options = {
      where,
      limit: config.maxPageSize,
      offset: (req.page - 1) * config.maxPageSize
    }

    if (req.attributes) {
      options.attributes = req.attributes
    }

    Promise
    .all([Model.count(options), Model.findAll(options)])
    .then(([count, docs]) => resolve({count, docs}))
    .catch(reject)
  })

  /*
   * Controller for GET /:id
   */
  e.one = (req) => new Promise((resolve, reject) => {
    const where = Object.assign({uuid: req.params.id}, querify(req))
    const options = {where}

    if (req.attributes) {
      options.attributes = req.attributes
    }

    Model
    .findOne(options)
    .then(resolve)
    .catch(reject)
  })

  /*
   * Controller for POST /
   */

  const ilinkto = Object.keys(config.resources).filter(r =>
    config.resources[r].linkedResources.includes(resource)
  )

  const options = {
    include: ilinkto.map(l => config.resources[l].Model)
  }

  e.create = (req) => new Promise((resolve, reject) => {
    const validation = validate(req)

    if (validation.error) {
      res.status(400).json(osdiError(validation.error))
    }

    Model
    .create(req.body, options)
    .then(resolve)
    .catch(reject)
  })

  /*
   * Controller for PUT /:id
   */
  e.edit = (req) => new Promise((resolve, reject) => {
    const validation = validate(req)

    if (validation.error) {
      res.status(400).json(osdiError(validation.error))
    }

    const where = {uuid: req.params.id}

    if (validation.query) {
      Object.assign(where, validation.query)
    }

    const options = Object.assign({where}, {returning: true});

    if (req.attributes) {
      options.attributes = req.attributes
    }

    Model
    .update(req.body || {}, options)
    .then(([affectedCount, affectedRows]) =>
      affectedCount == 0
        ? reject('Nothing affected')
        : resolve(affectedRows[0])
    )
    .catch(reject)
  })

  /*
   * Controller for DELETE /:id
   */
  e.remove = (req) => new Promise((resolve, reject) => {
    Model
    .delete({where: {uuid: req.params.id}})
    .then(resolve)
    .catch(reject)
  })

  return e
}
