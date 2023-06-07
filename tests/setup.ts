import { createStaffingAppInstance } from "../src/server"

beforeAll(async () => {
  const [app, hatchedKoa] = createStaffingAppInstance()

  await hatchedKoa.createDatabase()

  global.app = app
  global.hatchedKoa = hatchedKoa
  global.model = hatchedKoa.model
})

// afterAll(() => {
//   global.hatchedKoa.orm.close()
// })
