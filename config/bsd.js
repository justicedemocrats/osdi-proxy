const log = require("debug")("osdi-proxy:bsd:");

const config = {
  base: process.env.BSD_BASE,
  app_id: process.env.BSD_APP_ID,
  app_key: process.env.BSD_APP_KEY,
  browser_url_base: process.env.BSD_EVENT_URL_BASE,
  system_name: process.env.SYSTEM_NAME,
  page_size: 5000,
  resource_map: {
    people: [],
    events: ["attendances"]
  },
  crud: require("../adaptors/bsd"),
  validate: () =>
    ["BSD_BASE", "BSD_APP_ID", "BSD_APP_KEY", "BSD_EVENT_URL_BASE"].forEach(
      env => {
        if (!process.env[env]) {
          log("[Error]: Missing env var %s – required for BSD adaptor", env);
          process.exit();
        }
      }
    )
};

module.exports = config;
