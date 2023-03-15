import { createStaffingAppInstance } from '../src/server'

beforeAll(async () => {
  const [app, scaffold] = createStaffingAppInstance()

  await scaffold.createDatabase()

  global.app = app
  global.scaffold = scaffold
  global.model = scaffold.model
})

// afterAll(() => {
//   global.scaffold.orm.close()
// })
