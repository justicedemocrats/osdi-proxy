const config = {
  base: process.env.AK_BASE,
  username: process.env.AK_USERNAME,
  password: process.env.AK_PASSWORD,
  defaultCampaign: process.env.AK_DEFAULT_CAMPAIGN
}

module.exports = {
  motd: 'Welcome to an OSDI proxy of Action Kit',
  vendorName: 'Action Kit',
  productName: 'Action Kit',
  namespace: "ak",
  maxPageSize: 100,
  baseUrl: process.env.BASE_URL || 'localhost:3000',
  resources: [
    require('../adaptors/actionkit')(config)
  ]
}
