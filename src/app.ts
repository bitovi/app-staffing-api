import { createStaffingAppInstance } from './server'

async function init() {
  const [app, scaffold] = await createStaffingAppInstance()

  await scaffold.createDatabase()

  app.on('error', (err, ctx) => {
    console.error('server error', err, ctx)
  })

  app.listen(3000, () => {
    console.log('Scaffold Started')
  })
}

init()
