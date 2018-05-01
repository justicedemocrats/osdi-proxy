module.exports = (api, config) => {
  return {
    create: async (params, object) => {
      const event_id = params.event || params.events;

      const { person } = object;

      const fields = {
        email: person.email_addresses
          ? person.email_addresses[0]
            ? person.email_addresses[0].address
            : null
          : null,
        phone: person.phone_numbers
          ? person.phone_numbers[0]
            ? person.phone_numbers[0].number
            : null
          : null,
        first_name: person.given_name,
        last_name: person.last_name
      };

      const resp = await api.post("action").send({
        page: "signup",
        event_id,
        event_signup_ground_rules: 1,
        ...fields
      });

      return resp.body;
    }
  };
};
