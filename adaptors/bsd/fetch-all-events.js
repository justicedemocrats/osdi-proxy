module.exports = async api => {
  console.log(2);
  const events = await api.searchEvents({
    date_start: "2000-01-01 00:00:00"
  });

  console.log(7);

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
  const search_results = await Promise.all(
    missing_ids.map(id =>
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

  console.log("33");

  /*
   * Search ahead
   */
  const search_ahead = 20;
  let found = 1;
  let cursor = max_id;

  while (found != 0) {
    console.log(`Checking for ${cursor}`);

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

  return events.concat(missing_events);
};
