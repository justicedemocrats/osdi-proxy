const config = {
  base: process.env.AK_BASE,
  username: process.env.AK_USERNAME,
  password: process.env.AK_PASSWORD
}

const ak = require('./adaptors/actionkit')(config)

const main = async () => {
  try {
    let allEvents = await ak.events.findAll()
    const id = allEvents[0].identifiers[0].split(':')[1]
    let rsvps = await ak.attendances.findAll({event: id})

    console.log(rsvps)
    console.log(rsvps.length)

    await Promise.all(rsvps.map(async rsvp => {
      const person = await ak.people.one(rsvp.person)
      console.log(person)
      return person
    }))
  } catch (ex) {
    console.log(ex)
  }
}

main().then(() => console.log('done'))
