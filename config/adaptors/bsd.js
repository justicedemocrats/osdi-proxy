const log = require("debug")("osdi-proxy:bsd:");

const config = env => ({
  base: env.BSD_BASE,
  app_id: env.BSD_APP_ID,
  app_key: env.BSD_APP_KEY,
  browser_url_base: env.BSD_EVENT_URL_BASE,
  system_name: env.SYSTEM_NAME,
  baseUrl: env.PROXY_BASE_URL,
  readOnly: env.READ_ONLY == "true",
  route: env.SYSTEM_NAME || env.ROUTE,
  page_size: 5000,
  resource_map: {
    people: [],
    events: ["attendances"]
  },
  crud: require("../../adaptors/bsd"),
  validate: () =>
    ["BSD_BASE", "BSD_APP_ID", "BSD_APP_KEY", "BSD_EVENT_URL_BASE"].forEach(
      env => {
        if (!env[variable]) {
          log(
            "[Error]: Missing env var %s – required for BSD adaptor",
            variable
          );
          process.exit();
        }
      }
    )
});

module.exports = config;
