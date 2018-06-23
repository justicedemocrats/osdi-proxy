const moment = require("moment-timezone");
const zipcode_to_timezone = require("zipcode-to-timezone");
const transformers = require("./event-transformers");
const eventCacheConstructor = require("./event-cache");
const log = require("debug")("osdi-proxy:bsd:events:");

const UPDATE_INTERVAL = 60000 * 10;

const isInPast = ev => {
  const time_zone = zipcode_to_timezone.lookup(ev.location.postal_code);
  const now = moment();
  const start = moment.tz(ev.start_date, time_zone);
  return start.unix() < now.unix();
};

module.exports = (api, config) => {
  const cacher = require("../../lib").cacher(`${config.system_name}-bsd-event`);
  const osdiify = transformers.osdiify(api, config);
  const bsdify = transformers.bsdify(api, config);
  const eventCache = eventCacheConstructor(
    api,
    config,
    cacher,
    osdiify,
    bsdify
  );

  // api
  //   .getEventByObfusicatedId("4jld5")
  //   .then(console.log)
  //   .catch(console.error);

  // api.searchEvents().then(console.log);

  eventCache.update();
  setInterval(() => eventCache.update(), UPDATE_INTERVAL);

  const count = async () => {
    const events = await cacher.get(`all-1`);
    return events.length;
  };

  const findAll = async params => {
    return await cacher.fetch_and_update(
      `all-${params.page}`,
      (async () => {
        return await eventCache.getAll();
      })()
    );
  };

  const one = async id => {
    return await cacher.get(`event-${id}`);
  };

  const create = async object => {
    if (isInPast(object)) {
      throw new Error("Event is in past");
    }

    const ready = await bsdify(object, null, true);
    const result = await api.createEvent(ready);

    const { creator_cons_id, event_type, event_id_obfuscated } = result;
    log("Created event %s", event_id_obfuscated);

    const possible_matches = await api.searchEvents({
      create_day: moment().format("YYYY-MM-DD"),
      creator_cons_id
    });

    const { event_id } = await api.getEventByObfusicatedId(event_id_obfuscated);
    return await eventCache.updateOne(event_id);
  };

  const edit = async (id, edits) => {
    const matches = await api.searchEvents({
      event_id: id,
      date_start: "2000-01-01 00:00:00"
    });

    const existing = matches[0];
    const bsdified = await bsdify(edits, existing);
    const result = await api.updateEvent(bsdified);
    const ev = await eventCache.updateOne(id);
    return ev;
  };

  const doDelete = async id => {
    const result = await api.deleteEvent(id);
    eventCache.deleteOne(id);
    return result;
  };

  return { one, findAll, create, edit, delete: doDelete, count };
};
