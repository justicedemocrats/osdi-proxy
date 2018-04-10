const osdiify = async (api, ak) => {
  const phone_numbers = [];
  const phone_id = ak.phones[0] ? ak.phones[0].split("/")[4] : false;

  if (phone_id) {
    const result = await api.get(`phone/${phone_id}`);
    phone_numbers.push({ number: result.body.normalized_phone });
  }

  const postal_addresses = [
    {
      primary: true,
      address_lines: [ak.address1, ak.address2].filter(al => al != ""),
      locality: ak.city,
      region: ak.state,
      postal_code: ak.zip,
      country: ak.country
    }
  ];

  return {
    family_name: ak.last_name,
    given_name: ak.first_name,
    email_addresses: [{ address: ak.email }],
    phone_numbers,
    postal_addresses
  };
};

module.exports = (api, config) => {
  const cacher = require("../../lib").cacher(`${config.system_name}-ak-people`);

  return {
    one: async id => {
      return await cacher.fetch_and_update(
        id,
        (async () => {
          const result = await api.get(`user/${id}`);
          return await osdiify(api, result.body);
        })()
      );
    }
  };
};
