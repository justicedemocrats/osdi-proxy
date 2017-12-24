const express = require('express')

module.exports = client => {
  const app = express()

  app.get('/events', (req, res) => {
    client.events
      .findAll({ page: req.query.page || 0 })
      .then(events => {
        res.json(events)
      })
      .catch(res.status(400).json)
  })

  app.get('/events/:id', (req, res) => {
    client.events
      .one(req.params.id)
      .then(event => {
        res.json(event)
      })
      .catch(res.status(400).json)
  })

  app.post('/events', (req, res) => {
    client.events
      .create(req.body)
      .then(result => {
        res.json(result)
      })
      .catch(res.status(400).json)
  })

  app.post('/events/:id', (req, res) => {
    client.events
      .edit(req.params.id, req.body)
      .then(result => {
        res.json(result)
      })
      .catch(res.status(400).json)
  })

  app.get('/events/:id/rsvps', (req, res) => {
    client.attendances
      .findAll({ event: req.params.id, page: req.query.page || 0 })
      .then(attendances => {
        res.json(attendances)
      })
      .catch(res.status(400).json)
  })

  app.get('/events/:id/rsvp-count', (req, res) => {
    client.attendances
      .count({ event: req.params.id })
      .then(count => {
        res.json({ count })
      })
      .catch(res.status(400).json)
  })

  app.get('/people/:id', (req, res) => {
    client.people
      .one(req.params.id)
      .then(person => {
        res.json(person)
      })
      .catch(res.status(400).json)
  })

  return app
}
