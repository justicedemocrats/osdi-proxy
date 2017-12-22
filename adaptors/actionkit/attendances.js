const cacher = require('../../lib').cacher('ak-attendance')

const osdiify = async (api, ak) => {
  return {
    attended: ak.attended,
    person: ak.user.split('/')[4]
  }
}

const akify = async (api, osdi, config = {}) => {
  return {
    attended: osdi.attended
  }
}

module.exports = api => ({
  count: async ({ event }) => {
    const reference = event
    return await cacher.fetch_and_update(
      reference,
      (async () => {
        const result = await api.get('eventsignup').query({ event })
        return result.body.meta.total_count
      })()
    )
  },

  findAll: async params => {
    const page = (params && params.page) || 0
    const reference = `all-${page}`

    return await cacher.fetch_and_update(
      reference,
      (async () => {
        const results = await api
          .get('eventsignup')
          .query({ event: params.event, _offset: 100 * page, _limit: 100 })
        return await Promise.all(
          results.body.objects.map(obj => osdiify(api, obj))
        )
      })()
    )
  },

  one: async id => {
    return await cacher.fetch_and_update(
      id,
      (async () => {
        const result = await api.get(`eventsignup${id}`)
        return await osdiify(result)
      })()
    )
  },

  // create: async object => {
  //   return await api.post('eventsignupaction').send(akify(object))
  // },
  //
  // edit: async (id, edits) => {
  //   const result = await api.put(`event/${id}`).send(akify(edits))
  //   return osdiify(result)
  // },
  //
  // delete: async id => {
  //   return await api.put(`delete/${id}`)
  // }
})
