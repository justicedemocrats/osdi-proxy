const log = require("debug")("osdi-proxy:an:");

const config = env => ({
  page_size: 1000,
  actionnetwork_api_token: env.ACTIONNETWORK_API_TOKEN,
  system_name: env.SYSTEM_NAME,
  route: env.SYSTEM_NAME || env.ROUTE,
  baseUrl: env.PROXY_BASE_URL,
  readOnly: env.READ_ONLY == "true",
  crud: require("../../adaptors/actionnetwork"),
  resource_map: {
    events: ["record_attendance_helper"]
  },
  validate: () =>
    ["SYSTEM_NAME", "ACTIONNETWORK_API_TOKEN"].forEach(variable => {
      if (!env[variable]) {
        log(
          "[Error]: Missing env var %s – required for adaptor for %s",
          variable,
          env.SYSTEM_NAME
        );

        process.exit();
      }
    })
});

module.exports = config;
