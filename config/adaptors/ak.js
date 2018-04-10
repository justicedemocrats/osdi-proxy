const log = require("debug")("osdi-proxy:ak:");

const config = env => ({
  page_size: 100,
  base: env.AK_BASE,
  username: env.AK_USERNAME,
  password: env.AK_PASSWORD,
  defaultCampaign: env.AK_DEFAULT_CAMPAIGN,
  system_name: env.SYSTEM_NAME,
  route: env.SYSTEM_NAME || env.ROUTE,
  eventUrlBase: env.AK_EVENT_URL_BASE,
  baseUrl: env.PROXY_BASE_URL,
  readOnly: env.READ_ONLY == "true",
  crud: require("../../adaptors/actionkit"),
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
    ].forEach(variable => {
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
