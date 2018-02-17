const express = require("express");
const debug = require("debug");
const handleError = require("./utils/handle-error");
const paginate = require("./utils/paginate");
const halify = require("./utils/halify");

// TODO - use all named parameters for halify

module.exports = (resource, all_clients, config) => {
  const client = all_clients[resource];
  const linked_resources = config.resource_map[resource];

  const log = debug(`${config.route}:${resource}`);
  const app = express();

  log("Initializing %s...", resource);

  app.get("/", paginate, (req, res) => {
    log("GET /");

    Promise.all([client.count(req.query), client.findAll(req.query)])
      .then(([count, docs]) => {
        res.json(halify.collection(resource, req, { count, docs }, config));
      })
      .catch(handleError(res));
  });

  app.get("/:id", (req, res) => {
    log("GET /%s", req.params.id);

    client
      .one(req.params.id)
      .then(result => res.json(halify.object(resource, req, result, config)))
      .catch(handleError(res));
  });

  app.post("/", (req, res) => {
    log("POST /");

    client
      .create(req.body)
      .then(result => res.json(halify.object(resource, req, result, config)))
      .catch(handleError(res));
  });

  app.put("/:id", (req, res) => {
    log("PUT /%s", req.params.id);

    client
      .edit(req.params.id, req.body)
      .then(result => res.json(halify.object(resource, req, result, config)))
      .catch(handleError(res));
  });

  app.delete("/:id", (req, res) => {
    log("DELETE /%s", req.params.id);

    client
      .delete(req.params.id)
      .then(numDeleted =>
        res.json({ notice: `${numDeleted} rows were deleted` })
      )
      .catch(handleError(res));
  });

  linked_resources.forEach(lr => {
    const lr_client = all_clients[lr];

    app.get(`/:id/${lr}`, paginate, (req, res) => {
      log(`GET /${lr}`);

      const query = Object.assign(req.query, { [resource]: req.params.id });
      Promise.all([lr_client.count(query), lr_client.findAll(query)])
        .then(([count, docs]) => {
          res.json(halify.collection(resource, req, { count, docs }, config));
        })
        .catch(handleError(res));
    });

    app.post(`/:id/${lr}`, (req, res) => {
      // TODO - create linked resource
    });

    app.put(`/:id/${lr}/:lr_id`, (req, res) => {
      // TODO - modify linked resource
    });

    app.delete(`/:id/${lr}/:lr_id`, (req, res) => {
      // TODO – delete linked resource
    });
  });

  return app;
};
