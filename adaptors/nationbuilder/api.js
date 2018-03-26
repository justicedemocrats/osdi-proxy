const request = require("superagent");

module.exports = ({ slug, access_token }) => {
  const processUrl = url => {
    return `https://${slug}.nationbuilder.com/api/v1/${url}`;
  };

  const post_process = chainable =>
    chainable.query({ access_token }).accept("application/json");

  return {
    get: url => post_process(request.get(processUrl(url))),
    post: url => post_process(request.post(processUrl(url))),
    put: url => post_process(request.put(processUrl(url))),
    delete: url => post_process(request.delete(processUrl(url)))
  };
};
