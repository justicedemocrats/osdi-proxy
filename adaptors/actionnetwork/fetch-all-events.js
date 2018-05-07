const _ = require("lodash");

module.exports = async api => {
  const [regular_events, campaign_events] = await Promise.all([
    fetchAllEvents(api, [], 0),
    fetchAllCampaignEvents(api)
  ]);

  return regular_events.concat(campaign_events);
};

async function fetchAllEvents(api, acc, page) {
  const batch = await api.get("events").query({ page });
  const events = batch.body._embedded["osdi:events"];
  if (events.length === 0) {
    return acc.concat(events);
  } else {
    return fetchAllEvents(api, acc.concat(events), page + 1);
  }
}

async function fetchAllCampaignEvents(api) {
  const campaign_ids = await fetchAllEventCampaigns(api, [], 0);
  const event_batches = await Promise.all(
    campaign_ids.map(cid => fetchAllEventsForCampaign(api, cid, [], 0))
  );

  return _.flatten(event_batches);
}

async function fetchAllEventCampaigns(api, acc, page) {
  const batch = await api.get("event_campaigns").query({ page });
  const campaign_ids = batch.body._links["action_network:event_campaigns"].map(
    ({ href }) => _.last(href.replace(/\/$/, "").split("/"))
  );

  return campaign_ids;
}

async function fetchAllEventsForCampaign(api, campaign_id, acc, page) {
  const batch = await api
    .get(`event_campaigns/${campaign_id}/events`)
    .query({ page });
  const events = batch.body._embedded["osdi:events"];
  if (events.length == 0) {
    return acc.concat(events);
  } else {
    return fetchAllEventsForCampaign(
      api,
      campaign_id,
      acc.concat(events),
      page + 1
    );
  }
}
