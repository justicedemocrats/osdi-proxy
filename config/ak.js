const log = require('debug')('osdi-proxy:ak:')

const config = {
  base: process.env.AK_BASE,
  username: process.env.AK_USERNAME,
  password: process.env.AK_PASSWORD,
  defaultCampaign: process.env.AK_DEFAULT_CAMPAIGN,
  page_size: 50,
  eventUrlBase: 'https://go.justicedemocrats.com/event/event',
  crud: require('../adaptors/actionkit'),
  validate: () => ['AK_BASE', 'AK_USERNAME', 'AK_PASSWORD', 'AK_DEFAULT_CAMPAIGN'].forEach(env => {
    if (!process.env[env]) {
      log('[Error]: Missing env var %s – required for BSD adaptor', env)
      process.exit()
    }
  })
}

module.exports = config
