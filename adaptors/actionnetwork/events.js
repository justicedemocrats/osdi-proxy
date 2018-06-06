const moment = require("moment");
const log = require("debug")("osdi-proxy:an:events");
const fetchAllEvents = require("./fetch-all-events");
const _ = require("lodash");

const transform_event = (config, organizers) => event => {
  const id = event.identifiers[0].split(":")[1];

  const organizer_id = event._links["osdi:organizer"].href.split("/people/")[1];

  const new_props = Object.assign(
    {
      identifiers: [`${config.system_name || "actionnetwork"}:${id}`],
      id: id
    },
    organizers ? organizers[organizer_id] : {}
  );

  if (!event.end_date) {
    new_props.end_date = moment(event.start_date)
      .add(3, "hours")
      .toDate()
      .toISOString();
  }

  return Object.assign({}, event, new_props);
};

const fetchContactInfo = async (organizer_id, api) => {
  const resp = await api.get(`people/${organizer_id}`);
  const organizer = resp.body;

  return {
    contact: {
      name: `${organizer.given_name} ${organizer.family_name}`,
      email_address: organizer.email_addresses[0].address
    }
  };
};

const fetchAllOrganizers = async (events, api) => {
  const organizers = {};

  const organizer_ids = [
    ...new Set(
      events.map(e => e._links["osdi:organizer"].href.split("/people/")[1])
    )
  ];

  log("Must fetch %d organizers", organizer_ids.length);

  const chunks = _.chunk(organizer_ids, 5);
  for (let chunk of chunks) {
    await Promise.all(
      chunk.map(async oid => {
        log("Fetching %s", oid);
        try {
          const contact_info = await fetchContactInfo(oid, api);
          organizers[oid] = contact_info;
          log("Fetched %s", oid);
        } catch (ex) {
          log("Could not fetch %s", oid);
        }
      })
    );
  }

  return organizers;
};

module.exports = (api, config) => {
  const cacher = require("../../lib").cacher(`${config.system_name}-an-event`);

  const count = async () => {
    return await cacher.fetch_and_update(
      "count",
      (async () => {
        const events = await fetchAllEvents(api);
        const allEvents = await Promise.all(
          events.map(transform_event(api, config))
        );
        return _.uniqBy(allEvents, "id").length;
      })()
    );
  };

  const findAll = async params => {
    return await cacher.fetch_and_update(
      "all",
      (async () => {
        const events = await fetchAllEvents(api);
        const organizers = await fetchAllOrganizers(events, api);
        const allEvents = events.map(transform_event(config, organizers));
        const result = _.uniqBy(allEvents, "id");
        return result;
      })()
    );
  };

  const one = async id => {
    const result = await api.get(`events/${id}`);
    const organizaers = await fetchAllOrganizers([result.body], api);
    const transformed = transform_event(api, organizers)(result.body);
    return transformed;
  };

  return { count, findAll, one };
};
