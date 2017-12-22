const config = {
  base: process.env.BSD_BASE,
  app_id: process.env.BSD_APP_ID,
  app_key: process.env.BSD_APP_KEY,
  browser_url_base: process.env.BSD_BROWSER_URL_BASE
}

const bsd = require('./adaptors/bsd')(config)

const main = async () => {
  try {
    const tester = {
      id: '44369',
      identifiers: ['bsd:44369'],
      location: {
        venue: 'My school',
        address_lines: ['4141 Spring Valley Rd', '{"t":[],"s":"confirmed"}'],
        locality: 'Addison',
        region: 'TX',
        postal_code: '75001',
        location: ['32.982201', '-96.835800']
      },
      browser_url: 'https://google.com/phonebank/45lt',
      name: 'ben-packer-test-event',
      title: 'Ben Packer Test Event',
      start_date: '2017-12-23T08:04:30.000Z',
      end_date: '2017-12-23T10:04:30.000Z',
      description: 'Ben Packer, test event. To be deleted.',
      instructions: 'come here',
      organizer_id: '970467',
      status: undefined,
      type: 'Phonebank',
      tags: [],
      contact: {
        email_address: 'dookie@gmail.com',
        phone_number: '2147010869',
        name: 'Ben Packer'
      }
    }

    // const result = await bsd.events.edit('44366', { status: 'rejected' })
    // const result = await bsd.events.edit('44369', {tags: ['hello']})

    // console.log(await bsd.events.one('44369'))

    // console.log(await bsd.events.findAll())
    // console.log(await bsd.attendances.findAll({event: '142'}))
    const events = await bsd.events.findAll()
    events.forEach(e => {
      if (e.id == '44369') {
        console.log(e)
      }
    })
    // console.log(await bsd.people.one('158453'))

    // let allEvents = await ak.events.findAll()
    // console.log(allEvents[0].contact.phone)
    // const id = allEvents[0].identifiers[0].split(':')[1]
    //
    // await ak.events.edit(id, { contact: {phone_number: '214'}})
    //
    // allEvents = await ak.events.findAll()
    // console.log(allEvents[0].contact.phone)
  } catch (ex) {
    if (ex.reponse && ex.reponse.body) {
      console.log(ex.response.body)
    } else {
      console.log(ex)
    }
  }
}

main().then(() => console.log('done'))
