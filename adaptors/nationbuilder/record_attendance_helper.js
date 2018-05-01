// TODO – this is just copied from AK as a placeholder
// module.exports = (api, config) => {
//   const create = (params, object) => {
//     const event_id = params.event || params.events;

//     const { person } = object;

//     const fields = {
//       email: person.email_addresses
//         ? person.email_addresses[0]
//           ? person.email_addresses[0].address
//           : null
//         : null,
//       phone: person.phone_numbers
//         ? person.phone_numbers[0]
//           ? person.phone_numbers[0].number
//           : null
//         : null,
//       first_name: person.given_name,
//       last_name: person.last_name
//     };

//     return await api.post("action").send({
//       page: "signup",
//       event_id,
//       event_signup_ground_rules: 1,
//       ...fields
//     });
//   };
// };
//
