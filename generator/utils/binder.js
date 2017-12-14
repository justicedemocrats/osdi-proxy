module.exports = (fn, attr) => (req, res, next) => {
  fn(req)
  .then(result => {
    if (Array.isArray(result))
      req[attr] = result
    next()
  })
  .catch(err => {
    return res.status(403).json(err)
  })
}
