import errorHandler from './managers/error-handler'
import { createStaffingAppInstance } from './server'

async function init() {
  const [app, scaffold] = await createStaffingAppInstance()

  await scaffold.createDatabase()

  app.on('error', errorHandler)

  app.listen(3000, () => {
    console.log('Scaffold Started')
  })
}

init()
