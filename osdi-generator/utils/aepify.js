/*
 * For producing the app entry point from config.json
 */

module.exports = config => {
  const aep = {
    motd: config.motd,
    vendor_name : config.vendorName,
    product_name : config.productName,
  	osdi_version : '1.0',
    max_pagesize: config.maxPageSize,
    namespace: config.namespace,
    _links: {
      self: {
        href: config.baseUrl,
        title: 'Entry Point'
      }
    }
  }

  for (let r in config.resources) {
    aep._links[`osdi:${r}`] = {
      href: `${config.baseUrl}/${r}`,
      title: r.charAt(0).toUpperCase() + r.slice(1)
    }
  }

  return aep
}
