const moment = require("moment-timezone");
const log = require("debug")("osdi-proxy:bsd:event-cache:");

module.exports = (api, config, cacher, osdiify, bsdify) => {
  const update = async () => {
    log("Starting cache update");
    const events = await api.searchEvents({
      date_start: "2000-01-01 00:00:00"
    });

    log("Got events.");

    const ids = events.map(e => parseInt(e.event_id)).sort((a, b) => a - b);
    const min_id = ids[0];
    const max_id = ids[ids.length - 1];

    const missing_ids = [];
    for (let i = min_id; i <= max_id; i++) {
      if (!ids.includes(i)) {
        missing_ids.push(i);
      }
    }

    const missing_events = [];

    /*
    * Search in between
    */
    log(`Events missing: ${JSON.stringify(missing_ids)}`);

    const missingEventChunks = chunkBy(missing_ids, 10);

    for (let chunk of missingEventChunks) {
      const search_results = await Promise.all(
        chunk.map(id =>
          api.searchEvents({
            date_start: "2000-01-01 00:00:00",
            event_id: id
          })
        )
      );

      search_results.forEach(array => {
        if (array[0]) {
          missing_events.push(array[0]);
        }
      });
    }
    /*
    * Search ahead
    */
    const search_ahead = 20;
    let found = 1;
    let cursor = max_id;

    while (found != 0) {
      log(`Checking for ${cursor}`);

      let nexts = await Promise.all(
        new Array(search_ahead).fill(null).map(async (_, inc) => {
          let results = await api.searchEvents({
            date_start: "2000-01-01 00:00:00",
            event_id: cursor + inc
          });
          return results[0];
        })
      );

      nexts.forEach(n => {
        if (n) {
          missing_events.push(n);
        }
      });

      found = nexts.filter(n => n).length;
      cursor = cursor + search_ahead;
    }

    const allEvents = events.concat(missing_events);

    log("Fetching hosts");
    // Fetch and map all hosts
    const creators = [...new Set(allEvents.map(e => e.creator_cons_id))];
    const chunks = chunkBy(creators, 500);
    const creatorConsChunks = await Promise.all(
      chunks.map(chunk => api.getConstituentsByIds(chunk))
    );

    const byId = {};
    creatorConsChunks.forEach(chunk => {
      chunk.forEach(c => {
        byId[c.id] = c;
      });
    });

    const results = await Promise.all(
      allEvents.map(e => osdiify(e, byId[e.creator_cons_id]))
    );

    log("Setting keys.");

    return await Promise.all(
      results.map(event => cacher.set(`event-${event.id}`, event))
    );
  };

  const updateOne = async id => {
    const matches = await api.searchEvents({
      event_id: id,
      date_start: "2000-01-01 00:00:00"
    });

    const result = await osdiify(matches[0]);
    cacher.set(`event-${id}`, result);
    return result;
  };

  const getAll = async () => {
    const ids = await cacher.keys("event-*");

    return Promise.all(
      ids.map(async id => {
        const just_id = id.split("event-")[1];
        return await cacher.get(`event-${just_id}`);
      })
    );
  };

  return { update, updateOne, getAll };
};

function chunkBy(list, n) {
  const chunks = [];
  const n_chunks = Math.ceil(list.length / n);

  return new Array(n_chunks)
    .fill(null)
    .map((_, idx) => list.slice(idx * n, (idx + 1) * n));
}
