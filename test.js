const config = {
  base: process.env.AK_BASE,
  username: process.env.AK_USERNAME,
  password: process.env.AK_PASSWORD
}

const ak = require('./adaptors/actionkit')(config)
const akApi = require('./adaptors/actionkit/api')(config)

const main = async () => {
  try {
    const event = {
      address1: ' ',
      city: 'Berkeley',
      state: 'CA',
      venue: 'TBA',
      public_description:
        'Alison Hartson is running a grassroots campaign for Senate to end government corruption and the influence of dark money in our political system. Justice Democrats has endorsed her because her platform aligns with our national platform. She is the only candidate with political organizing experience and willing to call out current incumbent, Dianne Feinstein, as part of that broken campaign finance system and we are going to organize and ensure that she will win in the most progressive state in the America: California\r\n\r\nHelp us make calls to Californians to let them know about Alison Hartson for U.S. California Senate!',
      directions: '',
      county: 'United States',
      zip: '',
      is_approved: false,
      title:
        'Call Out Corruption - Phone Bank for Alison Hartson for CA U.S. Senate 2018',
      status: 'active',
      campaign: '/rest/v1/campaign/2/',
      starts_at: '2018-01-13T08:00:00',
      ends_at: '2018-01-13T11:00:00',
      field_tags:
        '["Event: Should Contact Host","Calendar: Justice Democrats","Calendar: Brand New Congress"]',
      field_type: 'Phonebank',
      field_contact_email_address: 'Jeremyoziel@gmail.com',
      field_contact_phone_number: '(301) 7587786',
      field_contact_name: 'Jeremy Oziel'
    }

    const result = await akApi.post('event').send(event)

    console.log(result.body)

    // let allEvents = await ak.events.findAll()
    // console.log(allEvents[0].contact.phone)
    // const id = allEvents[0].identifiers[0].split(':')[1]
    //
    // await ak.events.edit(id, { contact: {phone_number: '214'}})
    //
    // allEvents = await ak.events.findAll()
    // console.log(allEvents[0].contact.phone)
  } catch (ex) {
    console.log(ex)
  }
}

main().then(() => console.log('done'))
