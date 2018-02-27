module.exports = (api, config) => {
  const osdiify = configureOsdify(api, config);

  const count = async () => {
    const result = await api.get("queryreport");
    return result.body.meta.total_count;
  };

  const findAll = async params => {
    const result = await api
      .get("queryreport")
      .query({ _offset: (params.page - 1) * 100, _limit: 100 });

    const { objects } = result.body;
    const final = await Promise.all(objects.map(osdiify));
    return final;
  };

  return { count, findAll };
};

const configureOsdify = (api, config) => async ak => {
  return {
    id: ak.id,
    identifiers: [`actionkit:${ak.id}`],
    name: ak.name,
    summary: ak.description,
    total_items: undefined
  };
};
