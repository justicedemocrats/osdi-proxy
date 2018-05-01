const request = require("superagent");

const standard = ({ mode, key, application_name }) => {
  const base_url = "https://api.securevan.com/v4/";
  const api_key = `${key}|${
    {
      voterfile: 0,
      mycampaign: 1
    }[mode]
  }`;

  return {
    get: url => request.get(base_url + url).auth(application_name, api_key),
    post: url => request.post(base_url + url).auth(application_name, api_key),
    put: url => request.put(base_url + url).auth(application_name, api_key),
    delete: url =>
      request.delete(base_url + url).auth(application_name, api_key)
  };
};

const osdi = ({ mode, key, application_name }) => {
  const base_url = "https://osdi.ngpvan.com/api/v1/";
  const api_key = `${key}|${
    {
      voterfile: 0,
      mycampaign: 1
    }[mode]
  }`;

  return {
    get: url => request.get(base_url + url).set("OSDI-API-Token", api_key),
    post: url => request.post(base_url + url).set("OSDI-API-Token", api_key),
    put: url => request.put(base_url + url).set("OSDI-API-Token", api_key),
    delete: url => request.delete(base_url + url).set("OSDI-API-Token", api_key)
  };
};

module.exports = config => ({
  standard: standard(config),
  osdi: osdi(config)
});
