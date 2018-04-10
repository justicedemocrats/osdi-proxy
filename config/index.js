const log = require("debug")("osdi-proxy:");
const adaptors = "bsd ak van an nb".split(" ");

module.exports = async () => {
  let configs;

  if (process.env.CONFIG_STRATEGY == "json") {
    // TODO - write json config strategy
  } else if (process.env.CONFIG_STRATEGY == "airtable") {
    const log_and_quit = variable => () => {
      log(
        `[Error]: Missing env var '${variable}', required with CONFIG_STRATEGY=airtable`
      );
      process.exit();
    };

    const apiKey =
      process.env.AIRTABLE_API_KEY || log_and_quit("AIRTABLE_API_KEY")();
    const base = process.env.AIRTABLE_BASE || log_and_quit("AIRTABLE_BASE")();
    const table =
      process.env.AIRTABLE_TABLE || log_and_quit("AIRTABLE_TABLE")();

    const airtable = new (require("airtable"))({ apiKey }).base(base);

    configs = [];

    return new Promise((resolve, reject) => {
      airtable(table)
        .select()
        .eachPage(
          (records, next) => {
            records.forEach(record => {
              const env = {
                SYSTEM_NAME: record.fields["System Name"],
                PROXY_BASE_URL: record.fields["Proxy Base Url"],
                READ_ONLY: record.fields["Read Only"],
                ...JSON.parse(record.fields["Env"])
              };

              const config = require(`./adaptors/${record.fields.Crm}`)(env);
              config.validate();
              configs.push(config);
            });

            next();
          },
          _done => {
            resolve(configs);
          }
        );
    });
  } else {
    const selection = process.env.USE_CRM;

    if (!selection) {
      log("[Error]: Missing env var USE_CRM, or alternative CONFIG_STRATEGY");
      process.exit();
    }

    if (!adaptors.includes(selection)) {
      log("[Error]: Missing env var USE_CRM – must be one of %j", adaptors);
      process.exit();
    }

    const config = require(`./adaptors/${process.env.USE_CRM}`)(process.env);

    config.validate();

    configs = [config];
  }

  return configs;
};
