const redis = require("redis");
const util = require("util");
const client = redis.createClient(process.env.REDIS_URL);

let ON = true;
client.on("error", () => {
  ON = false;
});

const r = {
  get: util.promisify(client.get).bind(client),
  set: util.promisify(client.set).bind(client),
  keys: util.promisify(client.keys).bind(client)
};

module.exports = namespace => {
  const get = async path => {
    if (!ON) return undefined;
    const found = await r.get(`${namespace}/${path}`);
    return found ? JSON.parse(found) : null;
  };

  const set = async (path, obj, expiry) => {
    if (!ON) return undefined;
    const stringified = JSON.stringify(obj);

    if (expiry === undefined) {
      return await r.set(`${namespace}/${path}`, stringified);
    } else {
      return await r.set(`${namespace}/${path}`, stringified, "EX", expiry);
    }
  };

  const keys = async pattern => {
    if (!ON) return undefiend;
    return await r.keys(`${namespace}/${pattern}`);
  };

  const invalidate = async (path, use_prefix) => {
    if (!ON) return undefined;
    if (use_prefix) {
      return await r.del(`${namespace}/${path}`);
    } else {
      return await r.del(path);
    }
  };

  /*
   * This code leverages the fact that promises execute as soon as they are defined
   *
   * It takes the promise that fetches the data and wraps it inside another promise
   * that caches the data when it's resolved
   *
   * If the cache doesn't have an entry, we await the fetch_promise -> cache_promise
   * and return that data
   *
   * If that cache does have an entry, we return it, not awaiting the fetch -> cache,
   * but the fetch -> cache still occurs
   */
  const fetch_and_update = async (reference, fetch_promise) => {
    const cache_promise = new Promise((resolve, reject) =>
      fetch_promise
        .then(data => {
          set(reference, data); // no need to await this
          return resolve(data);
        })
        .catch(reject)
    );

    const current = await get(reference);
    if (current === null || current === undefined) {
      return await cache_promise;
    } else {
      return current;
    }
  };

  return { get, set, keys, invalidate, fetch_and_update, del };
};
