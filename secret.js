const secret = process.env.OSDI_API_TOKEN;

module.exports = (req, res, next) => {
  if (
    req.headers["OSDI-API-Token"] &&
    req.headers["OSDI-API-Token"] == secret
  ) {
    return next();
  } else {
    const error = req.headers["OSDI-API-Token"]
      ? "Invalid OSDI-API-Token"
      : "Missing header OSDI-API-Token";

    return res.status(403).json({ error });
  }
};
