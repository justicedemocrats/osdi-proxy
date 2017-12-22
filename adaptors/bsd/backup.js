const fetchAllEvents = require('./fetch-all-events')
const fs = require('fs')

const config = {
  base: process.env.BSD_BASE,
  app_id: process.env.BSD_APP_ID,
  app_key: process.env.BSD_APP_KEY,
  browser_url_base: process.env.BSD_BROWSER_URL_BASE
}

const api = require('./api')(config)

const go = async () => {
  const all_events = await fetchAllEvents(api)
  fs.writeFileSync('./beto-backup.json', JSON.stringify(all_events))
}

go().catch(console.error)
