const request = require("superagent");

module.exports = ({ actionnetwork_api_token }) => {
  const process_url = url => `https://actionnetwork.org/api/v2/${url}`;

  return {
    get: url =>
      request
        .get(process_url(url))
        .set("OSDI-API-Token", actionnetwork_api_token),

    post: url =>
      request
        .post(process_url(url))
        .set("OSDI-API-Token", actionnetwork_api_token),

    put: url =>
      request
        .put(process_url(url))
        .set("OSDI-API-Token", actionnetwork_api_token),

    delete: url =>
      request
        .delete(process_url(url))
        .set("OSDI-API-Token", actionnetwork_api_token)
  };
};
