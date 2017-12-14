const setUrlParam = require('./set-url-param')

const hrefify = href => ({href})
const e = {}

let config
e.initialize = (options) => {
  config = options
}

e.collection = (r, req, {count, docs}) => {
  const hal = {
    total_records: count,
    total_pages: Math.ceil(count / config.maxPageSize),
    page: req.page,
    _links: {},
    _embedded: {}
  }

  if (req.page < hal.total_pages)
    hal._links.next = hrefify(
      config.baseUrl + setUrlParam(req.originalUrl, {page: req.page + 1})
    )
  if (req.page > 1)
    hal._links.prev = hrefify(
      config.baseUrl + setUrlParam(req.originalUrl, {page: req.page - 1})
    )

  const links = []
  const embedded = []

  docs.forEach(d => {
    links.push(hrefify(config.baseUrl + req.baseUrl + '/' + d.uuid))
    embedded.push(Object.assign(d, {
      _links: /* TODO - build links from a resource */ {}
    }))
  })

  const withPrefix = `osdi:${r}`
  hal._links[withPrefix] = links
  hal._embedded[withPrefix] = embedded

  return hal
}

e.object = (r, req, doc) => {
  const _links = {}
  // TODO - build resource links
  return Object.assign(_links, doc)
}

module.exports = e
