import { createStaffingAppInstance } from './server'
import seedData from './db/seed'


async function init() {
  const [app, scaffold] = await createStaffingAppInstance()

  await scaffold.createDatabase()

  await seedData(scaffold)

  app.listen(3000, () => {
    console.log('Scaffold Started')
  })
}

init()
