const osdiify = async (api, ak) => {
  return {
    attended: ak.attended,
    person: ak.user.split("/")[4],
    referrer_data: {
      source: ak.source
    }
  };
};

const akify = async (api, osdi, config = {}) => {
  return {
    attended: osdi.attended
  };
};

module.exports = (api, config) => {
  const cacher = require("../../lib").cacher(
    `${config.system_name}-ak-attendance`
  );

  return {
    count: async params => {
      const event_id = params.event || params.events;
      return await cacher.fetch_and_update(
        `count-${event_id}`,
        (async () => {
          const result = await api
            .get("eventsignup")
            .query({ event: event_id });
          return result.body.meta.total_count;
        })()
      );
    },

    findAll: async params => {
      const event_id = params.event || params.events;
      const reference = `all-${params.page}`;

      const results = await api.get("eventsignup").query({
        event: event_id,
        _offset: 100 * (params.page - 1),
        _limit: 100
      });

      return await Promise.all(
        results.body.objects.map(obj => osdiify(api, obj))
      );
    },

    one: async id => {
      return await cacher.fetch_and_update(
        id,
        (async () => {
          const result = await api.get(`eventsignup${id}`);
          return await osdiify(result);
        })()
      );
    }

    // create: async object => {
    //   return await api.post('eventsignupaction').send(akify(object))
    // },
    //
    // edit: async (id, edits) => {
    //   const result = await api.put(`event/${id}`).send(akify(edits))
    //   return osdiify(result)
    // },
    //
    // delete: async id => {
    //   return await api.put(`delete/${id}`)
    // }
  };
};
