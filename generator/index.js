const generate = require('./generate')
const halify = require('./utils/halify')
const aepify = require('./utils/aepify')

const e = {}

e.initialize = (options) => {
  config = options
  halify.initialize(options)
}

e.aep = () => {
  if (!config)
    throw new Error('Must initialize osdi express with a config object before generating routes')
  return aepify(config)
}

e.generate = () => {
  if (!config)
    throw new Error('Must initialize osdi express with a config object before generating routes')

  const apps = {}
  for (let r in config.resources) {
    apps[r] = generate(r, config)
  }
  return apps
}

module.exports = e
