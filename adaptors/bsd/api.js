const requestPromise = require("request-promise");
const url = require("url");
const crypto = require("crypto");
const querystring = require("querystring");
const { parseString } = require("xml2js");
const moment = require("moment-timezone");
const util = require("util");

const parseStringPromise = util.promisify(parseString);

const e = {};

class BSDValidationError extends Error {
  constructor(message) {
    super(message);
    this.message = message;
    this.name = "BSDValidationError";
  }
}

class BSDExistsError extends Error {
  constructor(message) {
    super(message);
    this.message = message;
    this.name = "BSDExistsError";
  }
}

class BSD {
  constructor(host, id, secret) {
    this.baseURL = url.parse("http://" + host);
    this.baseURL.pathname = "/page/api/";
    this.apiId = id;
    this.apiVersion = 2;
    this.apiSecret = secret;
  }

  async noFailApiRequest(method, ...args) {
    try {
      return await this[method](...args);
    } catch (e) {
      console.error(e);
    }
  }

  cleanField(field) {
    if (field && field.length) {
      if (field[0] && field[0] != "") return field[0];
      else return null;
    } else return null;
  }

  createGroupObject(group) {
    let groupObj = {};
    groupObj["cons_group_id"] = group["$"]["id"];
    groupObj["modified_dt"] = group["$"]["modified_dt"];

    Object.keys(group).forEach(key => {
      groupObj[key] = this.cleanField(group[key]);
    });
    return groupObj;
  }

  createSurveyFormFieldObject(formField) {
    let formFieldObj = {};
    formFieldObj["signup_form_field_id"] = formField["$"]["id"];
    Object.keys(formField).forEach(key => {
      formFieldObj[key] = this.cleanField(formField[key]);
    });
    return formFieldObj;
  }

  createSurveyObject(survey) {
    let surveyObj = {};
    Object.keys(survey).forEach(key => {
      surveyObj[key] = this.cleanField(survey[key]);
    });
    return surveyObj;
  }

  createConstituentObject(constituent) {
    let consObj = {};
    consObj["id"] = constituent["$"]["id"];
    consObj["modified_dt"] = constituent["$"]["modified_dt"];

    let keys = [
      "firstname",
      "middlename",
      "lastname",
      "has_account",
      "is_banned",
      "create_dt",
      "prefix",
      "suffix",
      "gender",
      "source",
      "subsource"
    ];

    keys.forEach(key => {
      consObj[key] = this.cleanField(constituent[key]);
    });
    consObj["cons_addr"] = [];
    if (constituent.cons_addr) {
      constituent.cons_addr.forEach(address => {
        let addrObj = {};
        let keys = [
          "addr1",
          "addr2",
          "city",
          "state_cd",
          "zip",
          "country",
          "latitude",
          "longitude",
          "is_primary",
          "cons_addr_type_id",
          "cons_addr_type"
        ];
        keys.forEach(key => {
          addrObj[key] = this.cleanField(address[key]);
        });
        consObj["cons_addr"].push(addrObj);
      });
    }
    consObj["cons_phone"] = [];
    if (constituent.cons_phone) {
      constituent.cons_phone.forEach(phone => {
        let phoneObj = {};
        let keys = ["phone", "phone_type", "is_subscribed", "is_primary"];
        keys.forEach(key => {
          phoneObj[key] = this.cleanField(phone[key]);
        });
        consObj["cons_phone"].push(phoneObj);
      });
    }
    consObj["cons_email"] = [];
    if (constituent.cons_email) {
      constituent.cons_email.forEach(email => {
        let emailObj = {};
        let keys = ["email", "email_type", "is_subscribed", "is_primary"];
        keys.forEach(key => {
          emailObj[key] = this.cleanField(email[key]);
        });
        consObj["cons_email"].push(emailObj);
      });
    }

    return consObj;
  }

  generateBSDURL(callPath, params, method) {
    params = method === "POST" ? {} : Object.assign({}, params);

    if (callPath[0] === "/") callPath = callPath.substring(1, callPath.length);
    callPath = url.resolve(this.baseURL.pathname, callPath);
    let timestamp = Math.floor(Date.now() / 1000);
    params["api_ver"] = this.apiVersion;
    params["api_id"] = this.apiId;
    params["api_ts"] = timestamp;

    let sortedParams = Object.keys(params)
      .sort()
      .map(key => {
        let param = {};
        param[key] = params[key];
        return param;
      });

    let unencodedQueryString = sortedParams
      .map(element => {
        let key = Object.keys(element)[0];
        return key + "=" + element[key];
      })
      .join("&");

    let signingString = [
      params["api_id"],
      params["api_ts"],
      callPath,
      unencodedQueryString
    ].join("\n");

    let encryptedMessage = crypto.createHmac("sha1", this.apiSecret);
    encryptedMessage.update(signingString);
    let apiMac = encryptedMessage.digest("hex");
    sortedParams.push({ api_mac: apiMac });

    if (method === "POST") {
      let queryParamKeys = ["api_id", "api_ts", "api_ver", "api_mac"];
      sortedParams = queryParamKeys.map(key => {
        return sortedParams.find(el => el.hasOwnProperty(key));
      });
    }

    let encodedQueryString = sortedParams
      .map(element => {
        return querystring.stringify(element);
      })
      .join("&");

    let finalURL = url.parse(url.resolve(url.format(this.baseURL), callPath));
    finalURL.protocol = "https:";
    finalURL.search = "?" + encodedQueryString;

    return url.format(finalURL);
  }

  async getConstituentGroupByName(groupName) {
    let response = await this.request(
      "cons_group/get_constituent_group_by_name",
      { name: groupName },
      "GET"
    );
    response = await parseStringPromise(response);
    let group = response.api.cons_group;
    if (!group) return null;
    if (group.length && group.length > 0) group = group[0];

    return this.createGroupObject(group);
  }

  async deleteConstituentGroups(idArray) {
    return await this.request(
      "cons_group/delete_constituent_groups",
      { cons_group_ids: idArray.join(",") },
      "GET"
    );
  }

  async listConstituentGroups() {
    let response = await this.request("cons_group/list_constituent_groups");
    response = await parseStringPromise(response);
    let list = response.api.cons_group;
    if (!list) return null;
    return list;
  }

  async createConstituentGroups(groupNames) {
    const groups = [];
    let xml = '<?xml version="1.0" encoding="utf-8"?><api>';
    groupNames.forEach(name => {
      xml = xml + `<cons_group><name>${name}</name></cons_group>`;
    });
    xml = xml + "</api>";
    const response = await this.request(
      "cons_group/add_constituent_groups",
      xml,
      "POST"
    );
    return response;
  }

  async getConstituentGroup(groupId) {
    let response = await this.request(
      "cons_group/get_constituent_group",
      { cons_group_id: groupId },
      "GET"
    );
    response = await parseStringPromise(response);
    let group = response.api.cons_group;
    if (!group) return null;
    if (group.length && group.length > 0) group = group[0];

    return this.createGroupObject(group);
  }

  async mergeConsByEmail(email) {
    let response = await this.request(
      "cons/merge_constituents_by_email",
      {
        email
      },
      "GET"
    );

    response = await parseStringPromise(response);
    return response;
  }

  async processSignup(formId, formFieldValues) {
    let fields = "";

    Object.keys(formFieldValues).forEach(key => {
      let val = formFieldValues[key];
      if (val === true) val = "Yes";
      else if (val === false) val = "No";
      else if (val === null) val = "";
      fields =
        fields + `<signup_form_field id="${key}">${val}</signup_form_field>`;
    });
    let params = `<?xml version="1.0" encoding="utf-8"?><api><signup_form id="${formId}">${fields}</signup_form></api>`;

    let response = await this.request("/signup/process_signup", params, "POST");
  }

  async getFormSignupCount(formId) {
    let response = await this.request(
      "signup/signup_count",
      { signup_form_id: formId },
      "GET"
    );
    response = await parseStringPromise(response);
    return parseInt(response.api.count[0], 10);
  }

  async getForm(formId) {
    let response = await this.request(
      "signup/get_form",
      { signup_form_id: formId },
      "GET"
    );

    response = await parseStringPromise(response);
    let survey = response.api.signup_form;
    if (!survey) return null;
    if (survey.length && survey.length > 0) survey = survey[0];

    return this.createSurveyObject(survey);
  }

  async listFormFields(formId) {
    let response = await this.request("signup/list_form_fields", {
      signup_form_id: formId
    });
    response = await parseStringPromise(response);
    let formFields = response.api.signup_form_field;
    let formFieldsObjects = formFields.map(field => {
      let formFieldObj = this.createSurveyFormFieldObject(field);
      formFieldObj["signup_form_id"] = formId;
      // To make this consistent with other responses
      formFieldObj["modified_dt"] = formFieldObj["create_dt"];
      return formFieldObj;
    });

    return formFieldsObjects;
  }

  createBundleString(bundles) {
    return bundles.join(",");
  }

  async getConstituentByExtId(extType, extId) {
    let response = await this.request("/cons/get_constituents_by_ext_id", {
      ext_type: extType,
      ext_ids: extId
    });

    response = await parseStringPromise(response);
    let constituent = response.api.cons;

    if (!constituent) return null;
    if (constituent.length && constituent.length > 0)
      constituent = constituent[0];

    return this.createConstituentObject(constituent);
  }

  async getConstituentById(id) {
    let response = await this.request("/cons/get_constituents_by_id", {
      cons_ids: id,
      bundles: this.createBundleString([
        "cons_email",
        "cons_addr",
        "cons_phone"
      ])
    });

    response = await parseStringPromise(response);
    let constituent = response.api.cons;

    if (!constituent) return null;
    if (constituent.length && constituent.length > 0)
      constituent = constituent[0];

    return this.createConstituentObject(constituent);
  }

  async getConstituentsByIds(ids) {
    let response = await this.request("/cons/get_constituents_by_id", {
      cons_ids: ids.join(","),
      bundles: this.createBundleString([
        "cons_email",
        "cons_addr",
        "cons_phone"
      ])
    });

    response = await parseStringPromise(response);
    let constituents = response.api.cons;
    return constituents.map(c => this.createConstituentObject(c));
  }

  async getGroupsFromConsId(ids) {
    let response = await this.request("/cons/get_constituents_by_id", {
      cons_ids: Array.isArray(ids) ? ids : [ids],
      bundles: ["cons_group"]
    });

    response = await parseStringPromise(response);
    return response;
  }

  async getConstituentByEmail(email) {
    let response = await this.request(
      "/cons/get_constituents_by_email",
      {
        emails: email,
        bundles: this.createBundleString([
          "cons_email",
          "cons_addr",
          "cons_phone"
        ])
      },
      "GET"
    );

    response = await parseStringPromise(response);
    let constituent = response.api.cons;

    if (!constituent) return null;
    if (constituent.length && constituent.length > 0)
      constituent = constituent[0];

    return this.createConstituentObject(constituent);
  }

  async getConstituents(filter, bundles) {
    let filterStrings = [];
    Object.keys(filter).forEach(key => {
      let val = "";
      if (typeof filter[key].join === "function") {
        val = "(" + filter[key].join(",") + ")";
      } else val = filter[key];
      filterStrings.push(key + "=" + val);
    });
    let filterString = filterStrings.join(",");
    let response = await this.request(
      "cons/get_constituents",
      { filter: filterString, bundles: this.createBundleString(bundles) },
      "GET"
    );
    return JSON.parse(XMLParser.toJson(response)).map(element =>
      this.cleanConstituent(this.cleanOutput(element))
    );
  }

  async getConsIdsForGroup(groupId) {
    let response = await this.request("/cons_group/get_cons_ids_for_group", {
      cons_group_id: groupId
    });
    return {
      consIds: response.trim().split("\n")
    };
  }

  async getDeferredResult(deferredId) {
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        let response = await this.makeRESTRequest(
          "/get_deferred_results",
          { deferred_id: deferredId },
          "GET"
        );
        if (response.statusCode === 202)
          resolve(this.getDeferredResult(deferredId));
        else resolve(response.body);
      }, 1000);
    });
  }

  async getEventTypes() {
    let response = await this.request("event/get_available_types", {}, "GET");
    return response;
  }

  async setConstituentData(data) {
    /*
    Accepts data that looks like
    {
      cons_id: 342 // required
      firstname: 'John',
      lastname: 'Smith',
      cons_addr: {
        id: 2494 // optional -- only necessary if updating an existing bundle record
        city: 'Los Angeles',
        zip: '90007'
      }
    }

    Any key containing an object will be treated as a 'bundle'.
    See https://www.bluestatedigital.com/page/api/doc#-----------------Core--cons-------------

    Every field shown above is optional, with the exception of `cons_id`.
    */
    function generateXML(data) {
      let xmlData = "";
      function xmlForObject(obj, key) {
        const bundleIdString = obj.id ? ` id="${obj.id}"` : "";
        return `<${key}${bundleIdString}>${generateXML(obj)}</${key}>`;
      }
      Object.keys(data).forEach(key => {
        if (data[key] === null) {
          return;
        }

        if (Array.isArray(data[key])) {
          data[key].forEach(datum => {
            xmlData = xmlData + xmlForObject(datum, key);
          });
        } else if (typeof data[key] === "object") {
          xmlData = xmlData + xmlForObject(data[key], key);
        } else if (
          data.hasOwnProperty(key) &&
          key !== "cons_id" &&
          key !== "id" &&
          key !== "ext_id" &&
          key !== "ext_type" &&
          data[key] !== null &&
          data[key] !== undefined
        ) {
          let datum = data[key];
          if (typeof data[key] === "string") {
            datum = data[key].replace("&", "and");
          }
          xmlData = xmlData + `<${key}>${datum}</${key}>`;
        }
      });
      return xmlData;
    }

    const consIdString = `${data.cons_id ? 'id="' + data.cons_id + '"' : ""} ${
      data.ext_id ? 'ext_id="' + data.ext_id + '"' : ""
    } ${data.ext_type ? 'ext_type="' + data.ext_type + '"' : ""}`;
    let params = `<?xml version="1.0" encoding="utf-8"?><api><cons ${consIdString}>${generateXML(
      data
    )}</cons></api>`;

    let response = await this.request(
      "/cons/set_constituent_data",
      params,
      "POST"
    );
    response = await parseStringPromise(response);
    return response.api.cons[0]["$"];
  }

  async createConstituent(email, firstname, lastname) {
    let response = await this.setConstituentData({
      firstname,
      lastname,
      cons_email: {
        email
      }
    });
    response = await parseStringPromise(response);
    let constituent = await this.getConstituentByEmail(email);

    // generate a 'random' 9-14 character alphanumeric password
    let password = randString(Math.floor(Math.random() * 6) + 9);
    constituent["password"] = password;

    // set the constituent password asynchronously
    await this.setConstituentPassword(email, password);
    return constituent;

    function randString(x) {
      let s = "";
      while (s.length < x && x > 0) {
        let r = Math.random();
        s +=
          r < 0.1
            ? Math.floor(r * 100)
            : String.fromCharCode(Math.floor(r * 26) + (r > 0.5 ? 97 : 65));
      }
      return s;
    }
  }

  async setConstituentPassword(email, password) {
    // response will be empty if successful
    let response = await this.request(
      "/account/set_password",
      { userid: email, password },
      "POST"
    );
    return "password set";
  }

  async checkCredentials(email, password) {
    let response;
    try {
      response = await this.request(
        "/account/check_credentials",
        { userid: email, password },
        "POST"
      );
    } catch (e) {
      return "invalid username or password";
    }
    return await parseStringPromise(response);
  }

  async addRSVPToEvent(rsvpDetails) {
    let params = Object.assign(
      {
        will_attend: 1,
        guests: 0
      },
      rsvpDetails
    );

    let host = this.baseURL.protocol + "//" + this.baseURL.host;
    let URL =
      host + "/page/graph/addrsvp" + "?" + querystring.stringify(params);

    let options = {
      uri: URL,
      method: "GET",
      resolveWithFullResponse: true,
      json: true
    };
    let response = await this.requestWrapper(options);

    if (response.body && response.body.error)
      throw new BSDValidationError(JSON.stringify(response.body));
    return response;
  }

  async deleteEvent(event_id) {
    let response = this.request(
      "/event/delete_event",
      { event_id },
      "POST"
    ).catch(ex => {
      console.error(`BSD event ${event_id} could not be deleted.`);
    });

    return response;
  }

  async deleteEvents(eventIdArray) {
    let promises = eventIdArray.map(event_id => {
      return this.request("/event/delete_event", { event_id }, "POST").catch(
        ex => {
          console.error(`BSD event ${event_id} could not be deleted.`);
          console.error(ex);
        }
      );
    });
    let responses = await Promise.all(promises);
    return responses;
  }

  async searchEvents(params) {
    let response = await this.request("/event/search_events", params);
    return response;
  }

  async getEventByObfusicatedId(id) {
    let response = await this.request(
      "/event/get_event_details",
      {
        api_ver: 2,
        values: JSON.stringify({ event_id_obfuscated: id })
        // event_id_obfuscated: id
      },
      "GET"
    );
    return response;
  }

  async getRsvpsForEvent(id) {
    let response = await this.request("/event/list_rsvps", { event_id: id });
    return response;
  }

  apiInputsFromEvent(event) {
    let apiKeys = [
      "note",
      "event_id",
      "event_id_obfuscated",
      "event_type_id",
      "creator_cons_id",
      "name",
      "description",
      "creator_name",
      "local_timezone",
      "venue_name",
      "venue_addr1",
      "venue_addr2",
      "venue_zip",
      "venue_city",
      "venue_state_cd",
      "venue_country",
      "venue_directions",
      "host_addr_addressee",
      "host_addr_addr1",
      "host_addr_addr2",
      "host_addr_zip",
      "host_addr_city",
      "host_addr_state_cd",
      "host_addr_country",
      "host_receive_rsvp_emails",
      "contact_phone",
      "public_phone",
      "attendee_visibility",
      "attendee_require_phone",
      "attendee_volunteer_show",
      "attendee_volunteer_message",
      "is_official",
      "pledge_override_type",
      "pledge_show",
      "pledge_source",
      "pledge_subsource",
      "pledge_require",
      "pledge_min",
      "pledge_max",
      "pledge_suggest",
      "rsvp_use_default_email_message",
      "rsvp_email_message",
      "rsvrp_email_message_html",
      "rsvp_use_reminder_email",
      "rsvp_reminder_email_sent",
      "rsvp_reminder_hours",
      "rsvp_email_reminder_hours",
      "rsvp_allow",
      "rsvp_require_signup",
      "rsvp_disallow_account",
      "is_searchable",
      "chapter_id",
      "flag_approval",
      "outreach_page_id",
      "status",
      "days"
    ];

    let inputs = {};
    let eventDate = {};
    Object.keys(event).forEach(key => {
      if (key === "start_tz") {
        inputs["local_timezone"] = event[key];
      } else if (key === "start_dt") {
        eventDate["start_datetime_system"] = moment(event["start_dt"]).format(
          "YYYY-MM-DD HH:mm:ss"
        );
      } else if (key === "start_datetime_system") {
        eventDate["start_datetime_system"] = event["start_datetime_system"];
      } else if (key === "is_searchable") {
        inputs["is_searchable"] = event["is_searchable"]
          ? event["is_searchable"]
          : -2;
      } else if (key === "capacity") eventDate[key] = event[key];
      else if (key === "duration") eventDate[key] = event[key];
      else if (key === "contact_phone" && event[key])
        inputs[key] = event[key].replace(/\D/g, "");
      else if (key === "attendee_visibility") {
        inputs[key] = "NONE";
        if (event[key] === 0) inputs[key] = "COUNT";
        else if (event[key] === 2) inputs[key] = "FIRST";
      } else if (apiKeys.indexOf(key) !== -1) inputs[key] = event[key];
    });
    if (Object.keys(eventDate).length > 0 && !inputs.hasOwnProperty("days")) {
      eventDate["event_id"] = event.event_id;
      inputs["days"] = [eventDate];
    }

    return inputs;
  }

  async updateEvent(event) {
    let inputs = this.apiInputsFromEvent(event);

    // BSD API gets mad if we send this in
    delete inputs["event_id"];
    let response = await this.request(
      "/event/update_event",
      { event_api_version: 2, values: JSON.stringify(inputs) },
      "POST"
    );

    if (response.validation_errors) {
      let eventIdErrors = response.validation_errors.event_id_obfuscated;
      if (eventIdErrors && eventIdErrors.indexOf("exists_in_table") > -1)
        throw new BSDExistsError(JSON.stringify(response.validation_errors));
      throw new BSDValidationError(JSON.stringify(response.validation_errors));
    }
    return response;
  }

  async createEvent(event) {
    let params = this.apiInputsFromEvent(event);
    let response = await this.request(
      "/event/create_event",
      { event_api_version: 2, values: JSON.stringify(params) },
      "POST"
    );
    if (response.validation_errors)
      throw new BSDValidationError(JSON.stringify(response.validation_errors));
    else if (typeof response.event_id_obfuscated === "undefined")
      throw new Error(response);
    return response;
  }

  async addExtIdsToConstituentGroup(groupId, extIds) {
    let response = await this.request("/cons_group/add_ext_ids_to_group", {
      cons_group_id: groupId,
      ext_type: "nationbuilder_id",
      ext_ids: extIds.join(",")
    });
    return response;
  }

  async requestWrapper(options) {
    // These are methods for which we don't want to make a call to BSD when we are in dev
    let mockBSDMethodsInDev = ["/event/update_event", "/event/delete_event"];

    if (
      process.env.NODE_ENV === "development" &&
      mockBSDMethodsInDev.reduce(
        (prevVal, method) => prevVal || options.uri.search(method) !== -1,
        false
      )
    ) {
      return {
        statusCode: 200,
        body: { event_id_obfuscated: "test" }
      };
    } else {
      console.log(options);
      return requestPromise(options);
    }
  }

  async makeRESTRequest(callPath, params, method) {
    let finalURL = this.generateBSDURL(callPath, params, method);

    let options = {
      uri: finalURL,
      method,
      resolveWithFullResponse: true,
      json: true
    };

    if (method === "POST") {
      let body = Object.keys(params)
        .sort()
        .map(key => {
          let obj = {};
          obj[key] = params[key];
          return querystring.stringify(obj);
        })
        .join("&");

      options["body"] = body;
      options["headers"] = {
        "content-type": "application/x-www-form-urlencoded"
      };
    }

    return this.requestWrapper(options);
  }

  async makeSOAPRequest(callPath, params, method) {
    let finalURL = this.generateBSDURL(callPath, params, method);
    let options = {
      uri: finalURL,
      method,
      body: params,
      resolveWithFullResponse: true
    };

    return this.requestWrapper(options);
  }

  async request(callPath, params, method) {
    let response = null;
    if (
      typeof params === "string" &&
      params.toLowerCase().indexOf("<?xml") === 0
    ) {
      response = await this.makeSOAPRequest(callPath, params, method);
    } else {
      response = await this.makeRESTRequest(callPath, params, method);
    }

    // if (response.statusCode === 202)
    // return this.getDeferredResult(response.body)
    // else return response.body

    return response.body;
  }
}

module.exports = ({ base, app_id, app_key }) => new BSD(base, app_id, app_key);
