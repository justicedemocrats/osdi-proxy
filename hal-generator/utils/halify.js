const setUrlParam = require("./set-url-param");

const hrefify = href => ({ href });
const e = {};

e.collection = (r, req, { count, docs }, config) => {
  const hal = {
    total_records: count,
    total_pages: Math.max(Math.ceil(count / config.page_size), 1),
    per_page: config.page_size,
    page: req.query.page,
    _links: {},
    _embedded: {}
  };

  if (req.query.page < hal.total_pages)
    hal._links.next = hrefify(
      `https://` +
        req.hostname +
        setUrlParam(req.originalUrl, { page: req.query.page + 1 })
    );
  if (req.query.page > 1)
    hal._links.prev = hrefify(
      `https://` +
        req.hostname +
        setUrlParam(req.originalUrl, { page: req.query.page - 1 })
    );

  const links = [];
  const embedded = [];

  docs.forEach(d => {
    links.push(hrefify(`${config.baseUrl}/${r}/${d.id}`));

    embedded.push(
      d._links
        ? d
        : Object.assign(d, {
            _links: config.resource_map[r].reduce(
              (acc, lr) =>
                Object.assign(acc, {
                  [`osdi:${lr}`]: hrefify(
                    `${config.baseUrl}/${r}/${d.id}/${lr}`
                  )
                }),
              {}
            )
          })
    );
  });

  const withPrefix = `osdi:${r}`;
  hal._links[withPrefix] = links;
  hal._embedded[withPrefix] = embedded;

  return hal;
};

e.object = (r, req, doc, config) => {
  const _links = config.resource_map[r].reduce(
    (acc, lr) =>
      Object.assign(acc, {
        [`osdi:${lr}`]: hrefify(`${config.baseUrl}/${r}/${d.id}/${lr}`)
      }),
    {}
  );
  return Object.assign(_links, doc);
};

module.exports = e;
