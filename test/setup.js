const app = require('../src/server')()

global.beforeAll(() => {
  global.app = app
})

global.afterAll(() => {
  app.close()
})
