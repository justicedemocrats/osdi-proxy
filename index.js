const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const app = express();
const http = require("http");
const log = require("debug")("osdi-proxy:");
const osdiApp = require("./hal-generator");
const simpleApp = require("./simple-app");
const config = require("./config");
const secret = require("./secret");

/*
 * Set up global middlewares
 */
app.use(morgan("combined"));
app.use(bodyParser.json());

/*
 * Require a simple single api key secret
 */
app.use(secret);

/*
 * Attach the app specified by environment variables
 */

config().then(configs => {
  configs.forEach(config => {
    log("Attaching CRM %s", config.route);
    // app.use(`/${config.route}/simple`, simpleApp(config.crud(config)));
    app.use(`/${config.route}/osdi`, osdiApp(config.crud(config), config));
  });

  app.use(express.static("static"));

  // And 404s just in case
  app.use((req, res) => res.status(404).send("404"));

  /*
    * Get it started
    */
  const PORT = process.env.PORT || 3000;
  const server = http.createServer(app);

  server.listen(PORT);
  log("API listening on %d", PORT);
});
