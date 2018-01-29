const express = require("express");

module.exports = (client, config) => {
  const app = express();

  app.get("/events", async (req, res) => {
    try {
      const page = req.query.page || 0;

      const [total_records, records] = await Promise.all([
        client.count(),
        client.findAll({ page })
      ]);

      return res.json({
        total_records,
        page,
        per_page: config.page_size,
        total_pages: Math.ceil(total_records / config.page_size),
        _links: records.map(r => `${config.deployed_url}/events/${e.id}`),
        _embedded: {
          "osdi:events": records.map(r =>
            Object.assign(r, {
              self: { href: `${config.deployed_url}/events/${e.id}` },
              "osdi:attendances": {
                href: `${config.deployed_url}/events/${e.id}/attendances`
              }
            })
          )
        }
      });
    } catch (ex) {
      console.error(ex);
      return res.status(400).send(ex);
    }
  });

  app.get("/events/:id", async (req, res) => {
    try {
      const result = await client.events.one(req.params.id);
      return res.json(result);
    } catch (ex) {
      console.error(ex);
      return res.status(400).send(ex);
    }
  });

  app.post("/events", async (req, res) => {
    try {
      const result = await client.events.create(req.body);
      return res.json(result);
    } catch (ex) {
      console.error(ex);
      return res.status(400).send(ex);
    }
  });

  app.post("/events/:id", async (req, res) => {
    try {
      const result = await client.events.edit(req.params.id, req.body);
      return res.json(result);
    } catch (ex) {
      console.error(ex);
      return res.status(400).send(ex);
    }
  });

  app.get("/events/:id/rsvps", async (req, res) => {
    try {
      const result = await client.attendances.findAll({
        event: req.params.id,
        page: req.query.page || 0
      });
      return res.json(result);
    } catch (ex) {
      console.error(ex);
      return res.status(400).send(ex);
    }
  });

  app.get("/events/:id/rsvp-count", async (req, res) => {
    try {
      const result = await client.attendances.count({ event: req.params.id });
      return res.json(result);
    } catch (ex) {
      console.error(ex);
      return res.status(400).send(ex);
    }
  });

  app.delete("/events/:id", async (req, res) => {
    try {
      const result = await client.events.delete(req.params.id);
      return res.json(result);
    } catch (ex) {
      console.error(ex);
      return res.status(400).send(ex);
    }
  });

  app.get("/people/:id", async (req, res) => {
    try {
      const result = await client.people.one(req.params.id);
      return res.json(result);
    } catch (ex) {
      console.error(ex);
      return res.status(400).send(ex);
    }
  });

  return app;
};
