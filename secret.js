const secret = process.env.OSDI_API_TOKEN;

module.exports = (req, res, next) => {
  const header = req.headers["OSDI-API-Token"] || req.headers["osdi-api-token"];

  if ((header && header == secret) || req.path == "/") {
    return next();
  } else {
    const error = header
      ? "Invalid OSDI-API-Token"
      : "Missing header OSDI-API-Token";

    return res.status(403).json({ error });
  }
};
