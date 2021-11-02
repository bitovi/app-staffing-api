const fetch = require('node-fetch')
const config = require('../src/config')

const { start, stop } = require('../src/server')
const URL = `http://localhost:${config.get('APP_PORT')}`

beforeEach(async () => {
  await start()
})

afterEach(async () => {
  await stop()
})

test('GET /', async () => {
  const resp = await fetch(URL)
  const json = await resp.json()
  expect(json).toEqual({ hello: 'world' })
})
