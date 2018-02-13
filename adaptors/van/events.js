const cacher = require("../../lib").cacher("van-event");

module.exports = (api, config) => {
  const count = async () => {
    const result = await api.standard.get("events");
    return result.body.count;
  };

  const one = async id => {
    const result = await api.standard.get(`event/${id}`);
    return await osdify(result.body);
  };

  const findAll = async () => {
    const page = (params && params.page) || 0;
    const result = await api.standard.get("events");
    return await Promise.all(result.body.items.map(osdify));
  };

  return { count, one, findAll };
};
