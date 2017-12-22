const cacher = require('../../lib').cacher('ak-people')

const osdiify = async (api, ak) => {
  const phone_numbers = []
  const phone_id = ak.phones[0] ? ak.phones[0].split('/')[4] : false

  if (phone_id) {
    const result = await api.get(`phone/${phone_id}`)
    phone_numbers.push({ number: result.body.normalized_phone })
  }

  return {
    family_name: ak.last_name,
    given_name: ak.first_name,
    email_addresses: [{ address: ak.email }],
    phone_numbers
  }
}

module.exports = api => ({
  one: async id => {
    return await cacher.fetch_and_update(
      id,
      (async () => {
        const result = await api.get(`user/${id}`)
        return await osdiify(api, result.body)
      })()
    )
  }
})
