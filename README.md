# osdi-proxy

Goal: An adapter for the OSDI spec for every CRM.

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

# Roadmap

General

* [ ] Reuseable HAL navigation
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
