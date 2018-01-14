const express = require('express')

module.exports = client => {
  const app = express()

  app.get('/events', async (req, res) => {
    try {
      if (page == 'all') {
        let page = 0
        let next = await client.events.findAll({ page })
        let results = next.slice()

        while (next.length > 0) {
          page++
          next = await client.events.findAll({ page })
          results = results.concat(next)
        }
        return res.json(results)

      } else {
        const result = await client.events.findAll({
          page: req.query.page || 0
        })
        return res.json(result)
      }
    } catch (ex) {
      console.error(ex)
      return res.status(400).send(ex)
    }
  })

  app.get('/events/:id', async (req, res) => {
    try {
      const result = await client.events.one(req.params.id)
      return res.json(result)
    } catch (ex) {
      console.error(ex)
      return res.status(400).send(ex)
    }
  })

  app.post('/events', async (req, res) => {
    try {
      const result = await client.events.create(req.body)
      return res.json(result)
    } catch (ex) {
      console.error(ex)
      return res.status(400).send(ex)
    }
  })

  app.post('/events/:id', async (req, res) => {
    try {
      const result = await client.events.edit(req.params.id, req.body)
      return res.json(result)
    } catch (ex) {
      console.error(ex)
      return res.status(400).send(ex)
    }
  })

  app.get('/events/:id/rsvps', async (req, res) => {
    try {
      const result = await client.attendances.findAll({
        event: req.params.id,
        page: req.query.page || 0
      })
      return res.json(result)
    } catch (ex) {
      console.error(ex)
      return res.status(400).send(ex)
    }
  })

  app.get('/events/:id/rsvp-count', async (req, res) => {
    try {
      const result = await client.attendances.count({ event: req.params.id })
      return res.json(result)
    } catch (ex) {
      console.error(ex)
      return res.status(400).send(ex)
    }
  })

  app.delete('/events/:id', async (req, res) => {
    try {
      const result = await client.events.delete(req.params.id)
      return res.json(result)
    } catch (ex) {
      console.error(ex)
      return res.status(400).send(ex)
    }
  })

  app.get('/people/:id', async (req, res) => {
    try {
      const result = await client.people.one(req.params.id)
      return res.json(result)
    } catch (ex) {
      console.error(ex)
      return res.status(400).send(ex)
    }
  })

  return app
}
