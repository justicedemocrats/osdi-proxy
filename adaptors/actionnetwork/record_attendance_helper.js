module.exports = (api, config) => {
  return {
    create: async (params, object) => {
      const event_id = params.event || params.events;
      const result = await api
        .post(`events/${event_id}/attendances`)
        .send(object);
      return result.body;
    }
  };
};
