const cacher = require("../../lib").cacher("van-event");
const default_event_query = { $expand: "locations,roles" };

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
    const page_query = {
      $top: config.page_size,
      $skip: config.page_size * (params.page - 1)
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
    const first_host =
      event.roles.filter(r => r.isEventLead)[0] || config.defaultContact;

    const first_location =
      event.locations && event.locations[0] && event.locations[0].address
        ? event.locations[0]
        : {
            address: {}
          };

    return {
      title: event.name,
      description: event.description,
      start_date: event.startDate,
      end_date: event.endDate,
      created_date: event.createdDate,
      type: event.eventType.name.trim(),
      location: {
        public: event.isPubliclyViewable,
        venue: first_location.name,
        address_lines: [first_location.address.addressLine1].concat(
          first_location.address.addressLine2
            ? [first_location.address.addressLine2]
            : []
        ),
        locality: first_location.address.city,
        region: first_location.address.stateOrProvince,
        postal_code: first_location.address.zipOrPostalCode,
        location: first_location.address.geoLocation
          ? {
              latitude: first_location.address.geoLocation.lat,
              longitude: first_location.address.geoLocation.lon
            }
          : null
      },
      contact: first_host,
      id: event.eventId,
      identifiers: [`${config.system_name}:${event.eventId}`],
      instructions: null,
      status: event.isActive ? "confirmed" : "tentative",
      tags: []
    };
  };
};
