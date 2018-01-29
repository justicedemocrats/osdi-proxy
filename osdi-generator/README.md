# osdi-express

A route generator for OSDI endpoints that exposes GET, POST, PUT, and DELETE for
a given OSDI resource, complete with HAL style pagination, embedded results, and
links.

## Usage

### osdi.initialize(config)

`config` should contain all of the following fields

```javascript
osdi.initialize({
  motd: 'my nice message of the day!',
  vendorName: 'vendor name!',
  productName: 'product name!',
  namespace: "osdi-sample",
  maxPageSize: 25,                    // used for pagination length
  baseUrl: "https://osdi-sample.com", // used for constructing URLs in HAL
  resources: {
    people: {
      Model: Person,              // a Sequelize model (http://docs.sequelizejs.com/en/v3/)
                                  // or anything with the methods
                                  // .create(data), .edit(id, data), .findALl(query), .count(query)

      linkedResources: [          // a list of resources to link to
        'attendances'             // each of the resources must have a defined entry in this resources object
      ],

      querify: req => ({}),       // synchronous function that takes an express request object and
                                  // returns a valid sequelize query (http://docs.sequelizejs.com/en/v3/docs/querying/)
                                  // is passed directly to Model.findAll, .findOne, etc.
                                  // will be called for GET / and GET /:id


      restrict: (req) => Promise, // asynchronous function that returns a Promise
                                  // should resolve with either true or a list of attributes
                                  // that should be served in the response
                                  // if present, attributes will be passed to Model.findAll / .findOne
                                  //
                                  // should reject with an error that will be returned
                                  // to the user with a 403 if the requesting user should
                                  // not be allowed to access this endpoint
                                  //
                                  // Use this function to check request auth headers, etc.
                                  //
                                  // Will be called for all HTTP verbs - if you want to restrict
                                  // GET but not POST, just check `req.method` and respond
                                  // accordingly

      validate: (req) => object,  // synchronous function that takes an express request object and
                                  // performs validation on the request body - called for POST and PUT
                                  //
                                  // if object.error is null, the database call will proceed
                                  // if it exists, a 400 will be served with an OSDI-style error
                                  // (http://opensupporter.github.io/osdi-docs/errors.html#error-description)
                                  //
                                  // if object.query is not null and the method is a POST,
                                  // the database will only update if the given resource matches
                                  // the query

    }
  }
})
```

Calling `osdi.initialize(config)` is required before any of the other methods.

### osdi.aep()

Returns a properly formatted app entry point as a Javascript object. You should
return it on `GET /`.

```javascript
app.get('/', (req, res) => res.json(osdi.aep()))
```

### osdi.generate(resource, config)

Returns an express `app` object with the following endpoints:
```
GET     /
GET     /:id
POST    /
PUT     /:id
DELETE  /:id
```

And for everyone of a resources linkedResources,
```
GET     /:id/${linked}
```

So, running `osdi.generate('people', config)`, with the config object as the one
passed to `initialize` above, you would get the additional endpoint
```
GET     /:id/attendances
```

## Examples

Coming soon...
