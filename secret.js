const secret = process.env.SECRET

module.exports = (req, res, next) => {
  if (req.query.secret && req.query.secret == secret) {
    return next()
  } else {
    const error = req.query.secret ? 'Wrong secret' : 'Missing secret'
    return res.status(400).json({ error })
  }
}
