module.exports = (api, config) => {
  return {
    create: async (params, object) => {
      const event_id = params.event || params.events;

      console.log("hi");

      const resp = await api.osdi
        .post(`events/${event_id}/record_attendance_helper`)
        .send(object);

      console.log(resp);

      return resp.body;
    }
  };
};
