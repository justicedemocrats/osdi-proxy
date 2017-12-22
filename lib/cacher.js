const redis = require('redis')
const util = require('util')
const client = redis.createClient(process.env.REDIS_URL)

const get = util.promisify(client.get)
const set = util.promisify(client.set)

module.exports = namespace => {
  get: async (path) => {
    const found = await get(`${namespace}/path`)
    return found ? JSON.parse(found) : null
  },

  set: async (path, obj, expiry) => {
    const stringified = JSON.stringify(obj)

    if (expiry === undefined) {
      return await set(`${namespace}/path`, stringified)
    } else {
      return await set(`${namespace}/path`, stringified, 'EX', expiry)
    }
  }
}
