const moment = require("moment-timezone");
const zipcode_to_timezone = require("zipcode-to-timezone");

const to_standard_time_zone = {
  "US/Atlantic": "America/Puerto_Rico",
  "US/Eastern": "America/New_York",
  "US/Central": "America/Chicago",
  "US/Mountain": "America/Denver",
  "US/MST": "America/Phoenix",
  "US/Pacific": "America/Los_Angeles",
  "US/Alaska": "America/Anchorage",
  "Pacific/Honolulu": "America/Honolulu"
};

const to_bsd_time_zone = {};
Object.keys(to_standard_time_zone).forEach(key => {
  to_bsd_time_zone[to_standard_time_zone[key]] = key;
});

const inferStatus = bsd => {
  if (bsd.flag_approval == "1") {
    if (bsd.is_searchable == "1" || bsd.status == "1") {
      return "tentative";
    } else {
      return "rejected";
    }
  }

  return "confirmed";
};

const filterUndefined = obj => {
  return Object.keys(obj).reduce((acc, key) => {
    if (obj[key] !== undefined) {
      const addition = {};
      addition[key] = obj[key];
      return Object.assign(acc, addition);
    } else {
      return acc;
    }
  }, {});
};

const putDefault = val => (val == "" ? "default" : val);

const firstHaving = (list, attr) =>
  (match => (match ? match[attr] : undefined))(list.filter(el => el[attr])[0]);

module.exports = {
  osdiify: (api, config) => async (bsd, cons) => {
    const creator = cons || (await api.getConstituentById(bsd.creator_cons_id));

    let metadata = {};
    try {
      metadata = JSON.parse(bsd.attendee_volunteer_message) || {};
    } catch (ex) {
      // nothing
    }

    const time_zone =
      bsd.start_tz && to_standard_time_zone[bsd.start_tz]
        ? to_standard_time_zone[bsd.start_tz]
        : zipcode_to_timezone.lookup(bsd.venue_zip)
          ? zipcode_to_timezone.lookup(bsd.venue_zip)
          : "America/Chicago";

    const adjusted_start = moment(bsd.start_dt + "Z").tz(time_zone);

    return {
      id: bsd.event_id,
      identifiers: [`${config.system_name || "bsd"}:${bsd.event_id}`],
      capacity: bsd.capacity,
      attendance_count: bsd.attendee_count,
      location: {
        venue: bsd.venue_name,
        address_lines: [bsd.venue_addr1, bsd.venue_addr2],
        locality: bsd.venue_city,
        region: bsd.venue_state_cd,
        postal_code: bsd.venue_zip,
        location: {
          latitude: bsd.latitude,
          longitude: bsd.longitude
        },
        time_zone: time_zone
      },

      browser_url:
        config.browser_url_base +
        `${bsd.event_type_name.replace(/ /g, "").toLowerCase()}/${
          bsd.event_id_obfuscated
        }`,

      name: bsd.name ? bsd.name.toLowerCase().replace(/ /g, "-") : undefined,
      title: bsd.name,

      created_date: bsd.create_dt,
      start_date: adjusted_start.toISOString(),
      end_date: moment(adjusted_start)
        .add(bsd.duration, "minutes")
        .toISOString(),

      description: bsd.description,
      instructions: bsd.venue_directions,
      organizer_id: bsd.creator_cons_id,
      status: metadata.s || inferStatus(bsd),
      type: bsd.event_type_name,
      tags: metadata.t || [],
      contact: {
        email_address: firstHaving(creator.cons_email, "email"),
        phone_number: bsd.contact_phone,
        name: bsd.creator_name || `${creator.firstname} ${creator.lastname}`
      }
    };
  },

  bsdify: (api, config) => async (osdi, existing, castTimeZone) => {
    const getCreatorId = async () => {
      const creator_constituent = await api.getConstituentByEmail(
        osdi.contact.email_address
      );

      if (!creator_constituent) {
        const to_create = {
          cons_email: {
            email: osdi.contact.email_address,
            is_subscribed: 1,
            is_primary: 1
          },
          cons_phone: {
            phone: osdi.contact.phone_number,
            is_primary: 1
          },
          firstname:
            osdi.contact && osdi.contact.name
              ? osdi.contact.name.split(" ")[0]
              : undefined,
          lastname:
            osdi.contact && osdi.contact.name
              ? osdi.contact.name.split(" ")[1]
              : undefined
        };

        return (await api.setConstituentData(to_create)).id;
      } else {
        api.setConstituentData({
          cons_id: creator_constituent.id,
          cons_phone: {
            phone: osdi.contact.phone_number,
            is_primary: 1
          },
          firstname:
            osdi.contact && osdi.contact.name
              ? osdi.contact.name.split(" ")[0]
              : undefined,
          lastname:
            osdi.contact && osdi.contact.name
              ? osdi.contact.name.split(" ")[1]
              : undefined
        });
      }

      return creator_constituent.id;
    };

    const raw = await api.getEventTypes();

    const eventTypes = raw.reduce(
      (acc, type) =>
        Object.assign(acc, {
          [transformEventType(type.name)]: type.event_type_id
        }),
      {}
    );

    let metadata = {};
    try {
      metadata = JSON.parse(existing.attendee_volunteer_message);
    } catch (ex) {
      // nothing
    }

    if (osdi.tags) metadata.t = osdi.tags;
    if (osdi.status) metadata.s = osdi.status;

    if (osdi.type && !eventTypes[transformEventType(osdi.type)]) {
      throw new Error(
        `Unknown event type – try one of ${Object.keys(eventTypes).join(", ")}`
      );
    }

    const time_zone =
      to_bsd_time_zone[
        zipcode_to_timezone.lookup(
          (osdi.location && osdi.location.postal_code) || existing.venue_zip
        )
      ] || "America/Chicago";

    const adjusted_start = existing
      ? moment(existing.start_dt + "Z").tz(time_zone)
      : moment();

    const base = {
      attendee_volunteer_message:
        osdi.status || osdi.tags ? JSON.stringify(metadata) : undefined,
      name: osdi.title,
      event_type_id: osdi.type
        ? eventTypes[transformEventType(osdi.type)]
        : undefined,
      description: osdi.description,
      creator_cons_id:
        osdi.contact && osdi.contact.email_address
          ? await getCreatorId()
          : undefined,

      creator_name: osdi.contact ? osdi.contact.name : undefined,
      contact_phone:
        osdi.contact && osdi.contact.phone_number
          ? osdi.contact.phone_number
          : undefined,

      start_datetime_system: osdi.start_date
        ? moment.tz(osdi.start_date, time_zone).format("YYYY-MM-DD HH:mm:ss")
        : adjusted_start.format("YYYY-MM-DD HH:mm:ss"),
      duration:
        osdi.end_date && osdi.start_date
          ? moment
              .duration(moment(osdi.end_date).diff(moment(osdi.start_date)))
              .asMinutes()
          : undefined,

      local_timezone: osdi.start_date ? time_zone : undefined,
      start_tz: osdi.start_date ? time_zone : undefined,
      venue_name: osdi.location ? osdi.location.venue : undefined,
      venue_directions: osdi.instructions,
      venue_addr1:
        osdi.location && osdi.location.address_lines
          ? osdi.location.address_lines[0]
          : undefined,
      venue_addr2:
        osdi.location && osdi.location.address_lines
          ? osdi.location.address_lines[1]
          : undefined,
      venue_zip: osdi.location ? osdi.location.postal_code : undefined,
      venue_city: osdi.location ? osdi.location.locality : undefined,
      venue_state_cd: osdi.location ? osdi.location.region : undefined,
      capacity: osdi.capacity,
      host_addr_addressee: existing
        ? putDefault(existing.host_addr_addressee)
        : undefined,
      host_addr_addr1: existing
        ? putDefault(existing.host_addr_addr1)
        : undefined,
      host_addr_zip: existing ? putDefault(existing.host_addr_zip) : undefined,
      host_addr_city: existing
        ? putDefault(existing.host_addr_city)
        : undefined,
      host_addr_state_cd: existing
        ? putDefault(existing.host_addr_state_cd)
        : undefined,
      flag_approval: osdi.status
        ? osdi.status == "rejected" || osdi.status == "tentative"
          ? "1"
          : "0"
        : undefined,
      is_searchable: osdi.status
        ? osdi.status == "confirmed"
          ? 1
          : 0
        : undefined,
      rsvp_allow: osdi.status
        ? osdi.status == "confirmed"
          ? 1
          : 0
        : undefined,
      status: osdi.status
        ? osdi.status == "rejected" || osdi.status == "cancelled"
          ? "0"
          : "1"
        : undefined,
      attendee_require_phone: "1",
      host_receive_rsvp_emails: "0",
      rsvp_use_reminder_email: "1",
      rsvp_reminder_hours: 24,
      rsvp_email_reminder_hours: 24,
      attendee_visibility: 1
    };

    const copy = Object.assign({}, existing);
    Object.keys(base).forEach(attr => {
      if (base[attr] !== undefined) {
        copy[attr] = base[attr];
      }
    });
    return copy;
  }
};
