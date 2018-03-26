const zipcode_to_timezone = require("zipcode-to-timezone");
const cacher = require("../../lib").cacher("nb-event");
const limit = 1000;

module.exports = (api, config) => {
  const osdiify = configureOsdify(api, config);

  const count = async () => {
    const events = await fetchAllEvents(api, config);
    return events.length;
  };

  const findAll = async params => {
    const events = await fetchAllEvents(api, config);
    const page = events.slice(
      (params.page - 1) * config.page_size,
      params.page * config.page_size
    );
    return await Promise.all(page.map(osdiify));
  };

  const one = async id => {
    return await osdiify(
      await api.get(`sites/${config.site}/pages/events/${id}`)
    );
  };

  return { count, findAll, one };
};

function configureOsdify(api, config) {
  return async function osdiify(nb) {
    const time_zone = zipcode_to_timezone.lookup(nb.venue.address.zip5);

    return {
      id: nb.id,
      identifiers: `${config.system_name || "nationbuilder"}:${nb.id}`,
      status: {
        published: "confirmed"
      }[nb.status],
      title: nb.title,
      tags: nb.tags,
      description: nb.intro,
      contact: {
        name: nb.contact.name,
        phone_number: nb.contact.phone,
        email_address: nb.contact.email
      },
      start_date: nb.start_time,
      end_date: nb.end_date,
      capacity: nb.capacity,
      browser_url: `${config.eventBaseUrl}${nb.path}`,
      location: {
        venue: nb.venue.name,
        address_lines: [
          nb.venue.address.address1,
          nb.venue.address.address2,
          nb.venue.address.address3
        ].filter(a => a != "" && a != null),
        locality: nb.venue.address.city,
        region: nb.venue.address.state,
        country: nb.venue.address.country_code,
        postal_code: nb.venue.address.zip5,
        location: {
          latitude: nb.venue.address.lat,
          longitude: nb.venue.address.lng
        },
        time_zone: time_zone
      }
    };
  };
}

async function fetchAllEvents(api, config) {
  let response = await api
    .get(`sites/${config.site}/pages/events`)
    .query({ limit });

  let events = response.body.results;

  while (response.body.next != null) {
    let without_beginning = response.body.results.next.replace("/api/v1/", "");
    response = await api.get(without_beginning);
    events = events.concat(response.body.results);
  }

  return events.filter(ev => ev.venue.address);
}
