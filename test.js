const moment = require("moment-timezone");
const config = require("./config/adaptors/bsd.js");

const go = async () => {
  const conf = await config(process.env);
  console.log(conf);
  const api = require("./adaptors/bsd/api")(conf);
  const events = await api.searchEvents({
    create_day: moment.tz("UTC").format("YYYY-MM-DD")
    // creator_cons_id: "378455"
  });

  return events.map(e => e.name);
};

go()
  .then(console.log)
  .catch(console.error);
