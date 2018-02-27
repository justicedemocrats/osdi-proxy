const sql_parser = require("sql-parser");

const osdify = obj => {
  const [given_name, family_name] = obj.full_name
    ? (s => [s[0], s[s.length - 1]])(obj.full_name.split(" "))
    : [obj.first_name, obj.last_name];

  return {
    id: obj.user_id,
    identifiers: [`actionkit:${obj.user_id}`],
    given_name,
    family_name,
    phone_numbers: obj.phone_numbers
      ? obj.phone_numbers.split(",").map(number => ({ number }))
      : [],
    email_addresses: obj.user_email ? [{ address: obj.user_email }] : [],
    postal_addresses: obj.user_zip_postal
      ? [{ postal_code: obj.user_zip_postal }]
      : [],
    custom_fields: Object.keys(obj)
      .filter(
        column =>
          ![
            "given_name",
            "family_name",
            "full_name",
            "phone_numbers",
            "email",
            "user_id",
            "user_zip_postal",
            "user_email"
          ].includes(column)
      )
      .reduce((acc, field) => Object.assign(acc, { [field]: obj[field] }), {})
  };
};

/*
 * TODO - figure out pagination
 */

module.exports = (api, config) => {
  const count = async params => {
    const report = params.lists;
    return "hi";
  };

  const findAll = async params => {
    const report = params.lists;
    const [results, report_data] = await Promise.all([
      api.post(`report/run/${report}`),
      api.get(`queryreport/${report}`)
    ]);

    const sql = report_data.body.sql.replace(/\/\*(.|\n)*\*\//, "");
    const column_names = sql_parser.lexer
      .tokenize(sql)
      .filter(([token_kind, _a, _b]) => token_kind == "DBLSTRING")
      .map(([_a, field_name, _b]) => field_name);

    if (!column_names.includes("user_id")) {
      return Promise.reject({
        status: 400,
        error: `Report ${report} must include user id as a display field`
      });
    }

    const as_objects = results.body.map(r =>
      column_names.reduce(
        (acc, col, idx) => Object.assign(acc, { [col]: r[idx] }),
        {}
      )
    );

    return as_objects.map(osdify);
  };

  return { count, findAll };
};
