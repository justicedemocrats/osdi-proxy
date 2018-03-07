const log = require("debug")("osdi-proxy:an:");

const config = {
  page_size: 25,
  actionnetwork_api_token: process.env.ACTIONNETWORK_API_TOKEN,
  system_name: process.env.SYSTEM_NAME,
  crud: require("../adaptors/actionnetwork"),
  resource_map: {
    events: []
  },
  validate: () =>
    ["SYSTEM_NAME", "ACTIONNETWORK_API_TOKEN"].forEach(env => {
      if (!process.env[env]) {
        log("[Error]: Missing env var %s – required for AN adaptor", env);
        process.exit();
      }
    })
};

module.exports = config;
