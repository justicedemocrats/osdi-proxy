const log = require("debug")("osdi-proxy:nb:");

const config = {
  page_size: 500,
  slug: process.env.NATIONBUILDER_SLUG,
  access_token: process.env.NATIONBUILDER_ACCESS_TOKEN,
  site: process.env.NATIONBUILDER_SITE,
  system_name: process.env.SYSTEM_NAME,
  eventUrlBase: process.env.NATIONBUILDER_EVENT_URL_BASE,
  crud: require("../adaptors/nationbuilder"),
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
      if (!process.env[env]) {
        log("[Error]: Missing env var %s – required for AK adaptor", env);
        process.exit();
      }
    })
};

module.exports = config;
