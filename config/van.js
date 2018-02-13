const log = require("debug")("osdi-proxy:van:");

const config = {
  application_name: process.env.VAN_APP_NAME,
  key: process.env.VAN_API_KEY,
  mode: process.env.VAN_MODE,
  crud: require("../adaptors/van"),
  validate: () =>
    ["VAN_API_KEY", "VAN_MODE", "VAN_APP_NAME"].forEach(env => {
      if (!process.env[env]) {
        log("[Error]: Missing env var %s – required for BSD adaptor", env);
        process.exit();
      }

      if (
        env == "VAN_MODE" &&
        !["voterfile", "mycampaign"].includes(process.env[env])
      ) {
        log("[Error]: VAN_MODE must be one of 'voterfile', 'mycampaign'");
        process.exit();
      }
    })
};

module.exports = config;
