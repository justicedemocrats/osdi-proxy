const log = require("debug")("osdi-proxy:an:");

const config = env => ({
  page_size: 25,
  actionnetwork_api_token: env.ACTIONNETWORK_API_TOKEN,
  system_name: env.SYSTEM_NAME,
  route: env.SYSTEM_NAME || env.ROUTE,
  baseUrl: env.PROXY_BASE_URL,
  readOnly: env.READ_ONLY == "true",
  crud: require("../../adaptors/actionnetwork"),
  resource_map: {
    events: []
  },
  validate: () =>
    ["SYSTEM_NAME", "ACTIONNETWORK_API_TOKEN"].forEach(env => {
      if (!env[variable]) {
        log("[Error]: Missing env var %s – required for AN adaptor", variable);
        process.exit();
      }
    })
});

module.exports = config;
