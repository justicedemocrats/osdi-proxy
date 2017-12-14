const express = require('express')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const app = express()
const http = require('http')
const log = require('debug')('osdi-proxy:')
// const osdi = require('./generator')
const actionkit = require('./adaptors/actionkit')
const simpleApp = require('./simple-app')
const secret = require('./secret')

/*
 * Set up global middlewares
 */
app.use(morgan('combined'))
app.use(bodyParser.json())

/* TODO - actually make osdi - ey
osdi.initialize(config)

app.get('/', (req, res) => {
  res.json(osdi.aep())
})

const apps = osdi.generate(config.resources)
for (let r in apps) {
  app.use('/' + r, apps[r])
}
*/

const config = {
  base: process.env.AK_BASE,
  username: process.env.AK_USERNAME,
  password: process.env.AK_PASSWORD
}

app.use(secret)
app.use('/ak', simpleApp(actionkit(config)))

app.use((req, res) => {
  /* TODO: Process 404 */
  log('404!')
  res.status(404).send('404')
})

const PORT = process.env.PORT || 3000
const server = http.createServer(app)

server.listen(PORT)
log('API listening on %d', PORT)
