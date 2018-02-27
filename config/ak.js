const log = require("debug")("osdi-proxy:ak:");

const config = {
  page_size: 100,
  base: process.env.AK_BASE,
  username: process.env.AK_USERNAME,
  password: process.env.AK_PASSWORD,
  defaultCampaign: process.env.AK_DEFAULT_CAMPAIGN,
  eventUrlBase: process.env.AK_EVENT_URL_BASE,
  crud: require("../adaptors/actionkit"),
  resource_map: {
    people: [],
    events: ["attendances"],
    lists: ["items"]
  },
  validate: () =>
    [
      "AK_BASE",
      "AK_USERNAME",
      "AK_PASSWORD",
      "AK_DEFAULT_CAMPAIGN",
      "AK_EVENT_URL_BASE"
    ].forEach(env => {
      if (!process.env[env]) {
        log("[Error]: Missing env var %s – required for BSD adaptor", env);
        process.exit();
      }
    })
};

module.exports = config;
