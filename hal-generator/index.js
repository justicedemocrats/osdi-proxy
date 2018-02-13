const express = require("express");
const generate = require("./generate");
const halify = require("./utils/halify");
const aepify = require("./utils/aepify");

module.exports = (client, config) => {
  const app = express();

  app.get("/", (req, res) => res.json(aepify(config)));

  Object.keys(config.resource_map).forEach(r => {
    app.use(`/${r}`, generate(r, client, config));
  });

  return app;
};
