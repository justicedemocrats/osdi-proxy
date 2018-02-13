const qs = require('query-string')

module.exports = (url, param) => {
  let [base, query] = url.split('?')
  query = qs.stringify(Object.assign(qs.parse(query), param))
  return [base, query].join('?')
}
