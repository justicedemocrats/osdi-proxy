/*
 * For producing the app entry point from config.json
 */

module.exports = config => {
  const aep = {
    motd: config.motd,
    vendor_name: config.vendorName,
    product_name: config.productName,
    osdi_version: "1.0",
    _links: {
      self: {
        href: config.route + "/osdi",
        title: "Entry Point"
      }
    }
  };

  Object.keys(config.resource_map).forEach(r => {
    aep._links[`osdi:${r}`] = {
      href: `${config.route}/osdi/${r}`,
      title: r.charAt(0).toUpperCase() + r.slice(1)
    };
  });

  return aep;
};
