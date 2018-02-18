const cacher = require("../../lib").cacher("van-event");
const default_event_query = { $expand: ["locations", "roles"] };

module.exports = (api, config) => {
  const osdify = configureOsdify(api, config);

  const count = async () => {
    const result = await api.standard.get("events").query(default_event_query);
    return result.body.count;
  };

  const one = async id => {
    const result = await api.standard
      .get(`events/${id}`)
      .query(default_event_query);

    return await osdify(result.body);
  };

  const findAll = async params => {
    const page = (params && params.page) || 0;
    const page_query = {
      $top: config.page_size,
      $skip: config.page_size * page
    };

    const result = await api.standard
      .get("events")
      .query(default_event_query)
      .query(page_query);

    return await Promise.all(result.body.items.map(osdify));
  };

  return { count, one, findAll };
};

const configureOsdify = (api, config) => {
  return async function osdify(event) {
    console.log(event);

    const first_host = config.defaultContact;
    // event.roles.filter(r => r.isEventLead)[0] || config.defaultContact;

    const first_location = (event.locations && [0]) || { geoLocation: {} };

    return {
      title: event.name,
      description: event.description,
      start_date: event.startDate,
      end_date: event.endDate,
      type: event.eventType.name.trim(),
      location: {
        public: event.isPubliclyViewable,
        venue: first_location.name,
        address_lines: [
          first_location.addressLine1,
          first_location.addressLine2
        ],
        locality: first_location.city,
        region: first_location.stateOrProvince,
        postal_code: first_location.zipOrPostalCode,
        location: {
          latitude: first_location.geoLocation.lat,
          longitude: first_location.geoLocation.lon
        }
      },
      contact: first_host,
      id: event.eventId,
      identifiers: [`${config.system_name}:${event.eventId}`],
      instructions: null,
      status: event.isActive ? "confirmed" : "tentative"
    };
  };
};
