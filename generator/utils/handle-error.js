const log = require('debug')('swimmy:error')

const print = string => {
  log(string)
  return string
}

module.exports = res => err => err.status
  ? res.status(err.status).json(print(err))
  : res.status(500).json(print(err))
