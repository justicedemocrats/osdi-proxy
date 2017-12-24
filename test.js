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
      id: '474',
      identifiers: ['bsd:474'],
      location: {
        venue: 'My school',
        address_lines: ['4141 Spring Valley Rd', ''],
        locality: 'Addison',
        region: 'TX',
        postal_code: '75001'
      },
      title: 'Ben Packer Test Event',
      start_date: '2017-01-03T04:00:00.000Z',
      end_date: '2017-01-03T06:00:00.000Z',
      description:
        'Ben Packer, test event. To be deleted.',
      instructions: 'come here',
      status: 'confirmed',
      type: 'Volunteer activity',
      tags: [],
      contact: {
        email_address: 'dookie@gmail.com',
        phone_number: '2147010869',
        name: 'Ben Packer'
      }
    }

    const result = await bsd.events.create(tester)
    // const result = await bsd.events.edit('44356', {
    //   start_date: '2017-01-03T04:00:00.000',
    //   end_date: '2017-01-03T06:00:00.000'
    // })
    // const result = await bsd.events.edit('44368', {tags: ['hello']})
    // console.log(result)

    // console.log(await bsd.events.one('44356'))

    // console.log(await bsd.events.findAll())
    // const events = await bsd.events.findAll()
    // console.log(events.filter(e => e.description.includes('Ben Packer')))
    // console.log(events[0])
    // console.log(new Set(events.map(e => e.flag_approval)))
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
