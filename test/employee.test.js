const fetch = require('node-fetch')
const config = require('../src/config')

const { start, stop } = require('../src/server')
const BASE_URL = `http://localhost:${config.get('APP_PORT')}`

beforeEach(async () => {
  await start()
})

afterEach(async () => {
  await stop()
})

test('should be able to insert employees', async () => {
  // create employees
  const payload = {
    data: {
      type: 'employee',
      attributes: {
        name: 'random' + Math.random()
      }
    }
  }

  const response = await fetch(`${BASE_URL}/employees`, {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: { 'Content-Type': 'application/vnd.api+json' }
  })
  const body = await response.json()
  const id = body?.data?.id

  // Check response status is not errorsome
  expect(body.title).toBeUndefined()
  expect(response.ok).toBe(true)

  // Check insert worked
  expect(body.data.attributes.name).toBe(payload.data.attributes.name)
  expect(id).toBeTruthy()

  // clean up
  await fetch(`${BASE_URL}/employees/${id}`, {
    method: 'DELETE'
  })
})

// TODO: sad path testing for all endpoints

test('should be able to get employees', async () => {
  const resp = await fetch(`${BASE_URL}/employees`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/vnd.api+json' }
  })
  const json = await resp.json()

  const employees = json.body

  expect(employees).to.have.length(2)
})
