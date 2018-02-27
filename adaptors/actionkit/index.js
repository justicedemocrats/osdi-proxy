module.exports = config => {
  const api = require("./api")(config);
  const exports = {};

  "people events attendances lists items"
    .split(" ")
    .forEach(key => (exports[key] = require(`./${key}`)(api, config)));

  return exports;
};
