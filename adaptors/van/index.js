module.exports = config => {
  const api = require("./api")(config);
  const exports = {};

  // "people events attendances"
  "events record_attendance_helper"
    .split(" ")
    .forEach(key => (exports[key] = require(`./${key}`)(api, config)));

  return exports;
};
