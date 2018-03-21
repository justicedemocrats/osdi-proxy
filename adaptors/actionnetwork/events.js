const moment = require("moment");

const transform_event = config => event => {
  const id = event.identifiers[0].split(":")[1];
  const organizer = event._embedded["osdi:organizer"];

  const new_props = {
    identifiers: [`${config.system_name || "actionnetwork"}:${id}`],
    id: id,
    contact: {
      name: `${organizer.given_name} ${organizer.family_name}`,
      email_address: organizer.email_addresses[0].address
    }
  };

  if (!event.end_date) {
    new_props.end_date = moment(event.start_date)
      .add(3, "hours")
      .toDate()
      .toISOString();
  }

  return Object.assign({}, event, new_props);
};

module.exports = (api, config) => {
  const count = async () => {
    const result = await api.get("events");
    return result.body.total_records;
  };

  const findAll = async params => {
    const result = await api.get("events").query({ page: params.page });
    return result.body._embedded["osdi:events"].map(transform_event(config));
  };

  return { count, findAll };
};
