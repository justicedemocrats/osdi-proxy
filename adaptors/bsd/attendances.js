const osdiify = async (api, bsd) => {
  return {
    // attended: ak.attended,
    person: bsd.attendee_cons_id
  };
};

module.exports = api => {
  const cacher = require("../../lib").cacher(
    `${config.system_name}-bsd-attendance`
  );

  return {
    count: async params => {
      return await cacher.fetch_and_update(
        params.events || params.event,
        (async () => {
          const event = await api.searchEvents({
            event_id: params.events || params.event
          });
          return event[0] ? event[0].attendee_count || 0 : null;
        })()
      );
    },
    findAll: async params => {
      const event_id = params.events || params.event;
      const { attendees } = await api.getRsvpsForEvent(`${event_id}`);
      return await Promise.all(attendees.map(obj => osdiify(api, obj)));
    }
  };
};
