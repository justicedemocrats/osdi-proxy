const setUrlParam = require("./set-url-param");

const hrefify = href => ({ href });
const e = {};

e.collection = (r, req, { count, docs }, config) => {
  const hal = {
    total_records: count,
    total_pages: Math.ceil(count / config.page_size),
    per_page: config.page_size,
    page: req.query.page,
    _links: {},
    _embedded: {}
  };

  if (req.query.page < hal.total_pages)
    hal._links.next = hrefify(
      config.baseUrl +
        setUrlParam(req.originalUrl, { page: req.query.page + 1 })
    );
  if (req.query.page > 1)
    hal._links.prev = hrefify(
      config.baseUrl +
        setUrlParam(req.originalUrl, { page: req.query.page - 1 })
    );

  const links = [];
  const embedded = [];

  docs.forEach(d => {
    links.push(hrefify(`${config.route}/osdi/${r}/${d.id}`));
    embedded.push(
      Object.assign(d, {
        _links: /* TODO - build links from a resource */ {}
      })
    );
  });

  const withPrefix = `osdi:${r}`;
  hal._links[withPrefix] = links;
  hal._embedded[withPrefix] = embedded;

  return hal;
};

e.object = (r, req, doc, config) => {
  const _links = {};
  // TODO - build resource links
  return Object.assign(_links, doc);
};

module.exports = e;
