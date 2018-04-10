const log = require("debug")("osdi-proxy:nb:");

const config = env => ({
  page_size: 500,
  slug: env.NATIONBUILDER_SLUG,
  access_token: env.NATIONBUILDER_ACCESS_TOKEN,
  site: env.NATIONBUILDER_SITE,
  system_name: env.SYSTEM_NAME,
  baseUrl: env.PROXY_BASE_URL,
  readOnly: env.READ_ONLY == "true",
  route: env.SYSTEM_NAME || env.ROUTE,
  eventUrlBase: env.NATIONBUILDER_EVENT_URL_BASE,
  crud: require("../../adaptors/nationbuilder"),
  resource_map: {
    events: []
  },
  validate: () =>
    [
      "NATIONBUILDER_SLUG",
      "NATIONBUILDER_ACCESS_TOKEN",
      "NATIONBUILDER_SITE",
      "SYSTEM_NAME",
      "NATIONBUILDER_EVENT_URL_BASE"
    ].forEach(env => {
      if (!env[variable]) {
        log("[Error]: Missing env var %s – required for AK adaptor", variable);
        process.exit();
      }
    })
});

module.exports = config;
