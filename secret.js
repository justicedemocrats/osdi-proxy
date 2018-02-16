const secret = process.env.OSDI_API_TOKEN;

module.exports = (req, res, next) => {
  console.log(req.headers);
  const header = req.headers["OSDI-API-Token"] || req.headers["osdi-api-token"];
  console.log(header);

  if ((header && header == secret) || req.path == "/") {
    return next();
  } else {
    const error = req.headers["OSDI-API-Token"]
      ? "Invalid OSDI-API-Token"
      : "Missing header OSDI-API-Token";

    return res.status(403).json({ error });
  }
};
