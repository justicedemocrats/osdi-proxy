const moment = require('moment')
const format = 'YYYY-MM-DDTHH:mm:ss'

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

const configureOsdify = (api, config) => async ak => {
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
    name: ak.title ? ak.title.toLowerCase().replace(/ /g, '-') : undefined,
    title: ak.title,
    start_date: ak.starts_at,
    end_date: ak.ends_at,
    description: ak.public_description,
    instructions: ak.directions,
    organizer_id: ak.creator.split('/')[4],
    status:
      ak.status == 'cancelled' || ak.status == 'deleted'
        ? ak.is_approved ? 'cancelled' : 'rejected'
        : ak.is_approved ? 'confirmed' : 'tentative',

    type: getEventField(ak, 'type') || 'Unknown',
    tags: getEventField(ak, 'tags')
      ? JSON.parse(getEventField(ak, 'tags'))
      : [],
    contact: {
      email_address: getEventField(ak, 'contact_email_address'),
      phone_number: getEventField(ak, 'contact_phone_number'),
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

const configureAkify = (api, config) => async osdi => {
  const result = filterUndefined({
    address1: osdi.location
      ? osdi.location.address_lines ? osdi.location.address_lines[0] : undefined
      : undefined,

    address2: osdi.location
      ? osdi.location.address_lines ? osdi.location.address_lines[1] : undefined
      : undefined,

    city: osdi.location ? osdi.location.locality : undefined,
    state: osdi.location ? osdi.location.region : undefined,
    venue: osdi.location ? osdi.location.venue : undefined,
    public_description: osdi.description,
    directions: osdi.instructions,
    county: 'United States',
    zip: osdi.location ? osdi.location.postal_code : undefined,
    is_approved: osdi.status == 'confirmed',
    title: osdi.title,
    status: {
      confirmed: 'active',
      tentative: 'active',
      rejected: 'cancelled',
      cancelled: 'deleted'
    }[osdi.status],
    creator: osdi.organizer_id
      ? `/rest/v1/user/${osdi.organizer_id}/`
      : undefined,
    campaign: `/rest/v1/campaign/${config.defaultCampaign}/`,
    starts_at: osdi.start_date
      ? moment(osdi.start_date).format(format)
      : undefined,
    ends_at: osdi.start_date ? moment(osdi.end_date).format(format) : undefined,
    field_tags: osdi.tags ? JSON.stringify(osdi.tags) : undefined,
    field_type: osdi.type,
    field_contact_email_address: osdi.contact
      ? osdi.contact.email_address
      : undefined,
    field_contact_phone_number: osdi.contact
      ? osdi.contact.phone_number
      : undefined,
    field_contact_name: osdi.contact ? osdi.contact.name : undefined
  })

  return result
}

const ensureUser = async (api, email_address) => {
  const found = await api.get('user').query({ email: email_address })

  let creator = found.body.objects[0] ? found.body.objects[0].id : undefined

  if (creator === undefined) {
    const created = await api.post('user').send({
      email: osdi.contact.email_address,
      phone: osdi.contact.phone_number,
      name: osdi.contact.name
    })

    const split_location = created.headers.location.split('/')
    const created_at = split_location[split_location.length - 2]
    creator = created_at
  }

  return creator
}

module.exports = (api, config) => {
  const osdiify = configureOsdify(api, config)
  const akify = configureAkify(api, config)

  return {
    count: async () => {
      const result = await api.get('event')
      return result.body.meta.total_count
    },
    findAll: async params => {
      const page = (params && params.page) || 0
      const result = await api
        .get('event')
        .query({ _offset: page * 100, _limit: 100 })
      const { objects } = result.body
      return await Promise.all(objects.map(osdiify))
    },
    one: async id => {
      const result = await api.get(`event/${id}`)
      return await osdiify(result.body)
    },
    create: async object => {
      object.organizer_id = await ensureUser(api, object.contact.email_address)
      const akified = await akify(object)

      const result = await api.post('event').send(akified)
      const split_location = result.headers.location.split('/')
      const event_id = split_location[split_location.length - 2]

      const for_field_creation = { id: event_id, fields: [] }

      const fields = Object.keys(akified).filter(key => key.startsWith('field'))

      await Promise.all(
        fields.map(attr =>
          setEventField(
            api,
            for_field_creation,
            attr.split('field_')[1],
            akified[attr]
          )
        )
      )

      const to_return = await api.get(`event/${event_id}`)
      return await osdiify(to_return.body)
    },
    edit: async (id, edits) => {
      const akified = await akify(edits, { id })

      console.log(akified)
      const original = (await api.get(`event/${id}`)).body

      const fields = Object.keys(akified).filter(key => key.startsWith('field'))

      await Promise.all(
        fields.map(attr =>
          setEventField(api, original, attr.split('field_')[1], akified[attr])
        )
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
