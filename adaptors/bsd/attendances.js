const cacher = require('../../lib').cacher('bsd-attendance')

const osdiify = async (api, bsd) => {
  return {
    // attended: ak.attended,
    person: bsd.attendee_cons_id
  }
}


module.exports = api => ({
  count: async (params) => {
    return await cacher.fetch_and_update(params.event, (async () => {
      const event = await api.searchEvents({event_id: params.event})
      return event[0] ? (event[0].attendee_count || 0) : null
    })())
  },
  findAll: async (params) => {
    if (params.page > 0) {
      return []
    }

    const { attendees } = await api.getRsvpsForEvent(params.event)
    return await Promise.all(attendees.map(obj => osdiify(api, obj)))
  }
})
