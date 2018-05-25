const osdiify = async (api, bsd) => {
  return {
    family_name: bsd.lastname,
    given_name: bsd.firstname,
    email_addresses: bsd.cons_email.map(e => ({ address: e.email })),
    phone_numbers: bsd.cons_phone.map(p => ({ number: p.phone })),
    postal_addresses: bsd.cons_addr.map(a => ({
      address_lines: [a.addr1, a.addr2],
      locality: a.city,
      region: a.state_cd,
      postal_code: a.zip
    }))
  };
};

module.exports = api => ({
  one: async id => {
    const result = await api.getConstituentById(id);
    return await osdiify(api, result);
  }
});
