const request = require('superagent')

const ensureEndingSlash = url => (url.endsWith('/') ? url : `${url}/`)
const ensureNoBeginningSlash = url => (url.startsWith('/') ? url.slice(1) : url)
const ensureNoBeginningRest = url => url.replace('/rest/v1/', '')

const ensureSlashes = url => ensureEndingSlash(ensureNoBeginningSlash(ensureNoBeginningRest(url)))

module.exports = ({ base, username, password }) => {
  const processUrl = url => {
    return `${base}${ensureSlashes(url)}`
  }

  return {
    get: url => request.get(processUrl(url)).auth(username, password),
    post: url => request.post(processUrl(url)).auth(username, password),
    put: url => request.put(processUrl(url)).auth(username, password),
    delete: url => request.delete(processUrl(url)).auth(username, password)
  }
}
