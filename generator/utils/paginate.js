module.exports = (req, res, next) => {
  req.page = req.query.page
    ? parseInt(req.query.page)
    : 1

  next()
}
