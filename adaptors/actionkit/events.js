const getEventField = (ak, name) => {
  const match = ak.fields.filter(field => field.name == name)[0]
  return match ? match.value : undefined
}

const setEventField = async (api, ak, name, value) => {
  const match = ak.fields.filter(field => field.name == name)[0]

  if (match) {
    return await api.put(match.resource_uri).send({ value })
  } else {
    return await api
      .post(`eventfield`)
      .send({ value, event: `/rest/v1/event/${ak.id}/`, name })
  }
}

const configureOsdify = api => async (ak, config = {}) => {
  return {
    identifiers: [`actionkit:${ak.id}`],
    location: {
      venue: ak.venue,
      address_lines: [ak.address1, ak.address2],
      locality: ak.city,
      region: ak.state,
      postal_code: ak.zip,
      location: [ak.latitude, ak.longitude]
    },
    browser_url: config.eventUrlBase + `/${ak.id}`,
    name: ak.title ? ak.title.toLowerCase().replace(' ', '-') : undefined,
    title: ak.title,
    start_date: ak.starts_at,
    end_date: ak.ends_at,
    description: ak.public_description,
    instructions: ak.directions,
    organizer_id: ak.creator.split('/')[4],
    status: ak.is_approved ? 'tentative' : 'confirmed',
    type: getEventField(ak, 'type') || 'Unknown',
    tags: getEventField(ak, 'tags') ? getEventField(ak, 'tags').split(',') : [],
    contact: {
      email: getEventField(ak, 'contact_email'),
      phone: getEventField(ak, 'contact_phone'),
      name: getEventField(ak, 'contact_name')
    }
  }
}

const filterUndefined = obj => {
  return Object.keys(obj).reduce((acc, key) => {
    if (obj[key] !== undefined) {
      const addition = {}
      addition[key] = obj[key]
      return Object.assign(acc, addition)
    } else {
      return acc
    }
  }, {})
}

const configureAkify = api => async (osdi, config = {}) => {
  return filterUndefined({
    address1: osdi.location
      ? osdi.location.address_lines ? osdi.location.address_lines[0] : undefined
      : undefined,

    address2: osdi.location
      ? osdi.location.address_lines ? osdi.location.address_lines[1] : undefined
      : undefined,

    city: osdi.location ? osdi.location.locality : undefined,
    state: osdi.location ? osdi.location.region : undefined,
    venue: osdi.location ? osdi.location.venue : undefined,
    county: 'United States',
    zip: osdi.location ? osdi.location.postal_code : undefined,
    is_approved: osdi.status == 'confirmed',
    title: osdi.title,
    status: {
      confirmed: 'active',
      tentative: 'active',
      rejected: 'cancelled',
      cancelled: 'hide'
    }[osdi.status],
    starts_at: osdi.start_date,
    ends_at: osdi.end_date,
    field_tags: osdi.tags,
    field_type: osdi.type,
    field_contact_email: osdi.contact ? osdi.contact.email : undefined,
    field_contact_phone: osdi.contact ? osdi.contact.phone : undefined,
    field_contact_name: osdi.contact ? osdi.contact.name : undefined
  })
}

module.exports = api => {
  const osdiify = configureOsdify(api)
  const akify = configureAkify(api)

  return {
    count: async () => {
      const result = await api.get('event')
      return result.body.meta.total_count
    },
    findAll: async (params) => {
      const page = (params && params.page) || 0
      const result = await api.get('event').query({_offset: page * 100, _limit: 100})
      const { objects } = result.body
      return await Promise.all(objects.map(osdiify))
    },
    one: async id => {
      const result = await api.get(`event/${id}`)
      return await osdiify(result.body)
    },
    create: async object => {
      return await api.post('event').send(akify(object))
    },
    edit: async (id, edits) => {
      const akified = await akify(edits, {id})

      const original = (await api.get(`event/${id}`)).body
      const fields = Object.keys(akified).filter(key => key.startsWith('field'))

      await Promise.all(
        fields.map(attr => setEventField(api, original, attr.split('field_')[1], akified[attr]))
      )

      fields.forEach(f => {
        delete akified[f]
      })

      const result = await api.put(`event/${id}`).send(akified)
      return result.body
    },
    delete: async id => {
      return await api.put(`delete/${id}`)
    }
  }
}
