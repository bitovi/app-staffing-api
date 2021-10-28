const fetch = require('node-fetch')

const { start, stop } = require('../src/server')

beforeEach(async () => {
  await start()
})

afterEach(async () => {
  await stop()
})

test('GET /', async () => {
  const resp = await fetch('http://localhost:3000')
  const json = await resp.json()
  expect(json).toEqual({ hello: 'world' })
})
