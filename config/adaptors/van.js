const log = require("debug")("osdi-proxy:van:");

const config = env => ({
  page_size: 50,
  system_name: env.SYSTEM_NAME,
  application_name: env.VAN_APP_NAME,
  key: env.VAN_API_KEY,
  mode: env.VAN_MODE,
  baseUrl: env.PROXY_BASE_URL,
  readOnly: env.READ_ONLY == "true",
  defaultContact: {
    email_address: env.VAN_DEFAULT_CONTACT_EMAIL,
    phone_number: env.VAN_DEFAULT_CONTACT_PHONE,
    name: env.VAN_DEFAULT_CONTACT_NAME
  },
  crud: require("../../adaptors/van"),
  resource_map: {
    events: []
  },
  route: "van",
  validate: () =>
    [
      "VAN_API_KEY",
      "VAN_MODE",
      "VAN_APP_NAME",
      "SYSTEM_NAME",
      "VAN_DEFAULT_CONTACT_EMAIL",
      "VAN_DEFAULT_CONTACT_PHONE",
      "VAN_DEFAULT_CONTACT_NAME"
    ].forEach(env => {
      if (!env[variable]) {
        log("[Error]: Missing env var %s – required for BSD adaptor", env);
        process.exit();
      }

      if (
        variable == "VAN_MODE" &&
        !["voterfile", "mycampaign"].includes(env[variable])
      ) {
        log("[Error]: VAN_MODE must be one of 'voterfile', 'mycampaign'");
        process.exit();
      }
    })
});

module.exports = config;
