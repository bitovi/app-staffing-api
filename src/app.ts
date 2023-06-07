import seedData from "./db/seed"
import { createStaffingAppInstance } from "./server"

async function init() {
  const [app, hatchedKoa] = await createStaffingAppInstance()

  await hatchedKoa.createDatabase()

  await seedData(hatchedKoa)

  app.listen(3000, () => {
    console.log("Hatchify Started")
  })
}

init()
