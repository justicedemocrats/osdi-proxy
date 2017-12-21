const config = {
  base: process.env.BSD_BASE,
  app_id: process.env.BSD_APP_ID,
  app_key: process.env.BSD_APP_KEY,
  browser_url_base: process.env.BSD_BROWSER_URL_BASE
}

const bsd = require('./adaptors/bsd')(config)

const main = async () => {
  try {
    // const result = await bsd.events.edit('44366', {status: 'cancelled'})
    // const result = await bsd.events.edit('44368', {tags: ['hello']})
    // console.log(result)

    // console.log(await bsd.events.one('44368'))

    // console.log(await bsd.events.findAll())
    // console.log(await bsd.attendances.findAll({event: '142'}))
    await bsd.events.findAll()
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
