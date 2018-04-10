# osdi-proxy

Goal: An adapter for the OSDI spec for every CRM.

## Usage

### Basic

This Heroku button is easiest!
[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

### Multi-Tenant

This server also has the capacity to act as a mult-tenant proxy, i.e.

```
https://proxy-server.com/michael-cera-ak/osdi -> a proxy of Michael Cera's ActionKit
https://proxy-server.com/jake-tapper-bsd/osdi -> a proxy of Jake Tapper's Blue State Digital
```

To set it up like this, right now, you must use Airtable. More configuration options could easily be built.
To use Airtable configuration, you need to set `AIRTABLE_API_KEY`, `AIRTABLE_BASE`, and `AIRTABLE_TABLE`.

The code additionally expects a table with these columns: ![airtable columns](https://raw.githubusercontent.com/justicedemocrats/osdi-proxy/master/airtable-column-screenshot.png)

Where "Env" contains any CRM specific configuration.

# Roadmap

General

* [x] Reuseable HAL navigation
* [ ] Reuseable GraphQL
* [ ] Record signup helper
* [ ] Record attendance helper
* [ ] Record canvass response helper

By CRM

* [x] ActionNetwork. ActionNetwork already has an OSDI api. However, they have not
      implemented [#293](https://github.com/opensupporter/osdi-docs/pull/293), which adds
      a contact hash. Since I was using that, I made an ActionNetwork wrapper here only
      around the events collection. Any other use case should use ActionNetwork's API
      directly.

* [ ] ActionKit

  * [ ] People
    * [x] .one
    * [x] .count
    * [x] .findAll
    * [x] .edit
    * [x] .create
    * [x] .delete
    * [ ] Filtering
  * [ ] Events
    * [x] .one
    * [x] .count
    * [x] .findAll
    * [x] .edit
    * [x] .create
    * [x] .delete
    * [ ] Filtering
  * [ ] Attendances
    * [x] .one
    * [x] .count
    * [x] .findAll
    * [ ] .edit
    * [ ] .delete

* [ ] Blue State Digital

  * [ ] People
    * [x] .one
    * [ ] .count
    * [ ] .findAll
    * [ ] .edit
    * [x] .create
    * [ ] .delete
    * [ ] Filtering
  * [ ] Events
    * [x] .one
    * [x] .count
    * [x] .findAll
    * [x] .edit
    * [x] .create
    * [x] .delete
    * [ ] Filtering
  * [ ] Attendances
    * [x] .one
    * [x] .count
    * [x] .findAll
    * [ ] .edit
    * [ ] .delete

* [ ] VAN
  * [ ] People
    * [x] .one
    * [ ] .count
    * [ ] .findAll
    * [ ] .edit
    * [x] .create
    * [ ] .delete
    * [ ] Filtering
  * [ ] Events
    * [x] .one
    * [x] .count
    * [x] .findAll
    * [ ] .edit
    * [ ] .create
    * [ ] .delete
    * [ ] Filtering
  * [ ] Attendances
    * [ ] .one
    * [ ] .count
    * [ ] .findAll
    * [ ] .edit
    * [ ] .delete
