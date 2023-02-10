import { createStaffingAppInstance } from '../src/server'

const [app, scaffold] = createStaffingAppInstance()

global.beforeAll(async () => {
  await scaffold.createDatabase()

  global.app = app
  global.model = scaffold.model
})

global.afterAll(() => {
  scaffold.orm.close()
})
