const config = require("./config/van.js");
const api = require("./adaptors/van/api")(config);
const van_events = require("./adaptors/van/events")(api, config);

const go = async () => {
  const events = await van_events.findAll({ page: 1 });
  return events;
};

go()
  .then(console.log)
  .catch(console.error);
