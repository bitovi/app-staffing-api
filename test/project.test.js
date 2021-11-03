const fetch = require('node-fetch')
const config = require('../src/config')
const Project = require('../src/models/project')
const { start, stop } = require('../src/server')

const URL = `http://localhost:${config.get('APP_PORT')}`
let recordIds = []

beforeAll(async () => {
  await start()
})

afterAll(async () => {
  await stop()
})

afterEach(async () => {
  await Project.query().whereIn('id', recordIds).delete()
  recordIds = []
})

describe('POST', () => {
  test('should create a project record', async () => {
    const body = {
      data: {
        type: 'project',
        attributes: {
          name: 'Micheal Scott',
          start_date: new Date().toISOString(),
          end_date: new Date().toISOString()
        }
      }
    }
    const response = await fetch(`${URL}/projects`, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/vnd.api+json'
      }
    })

    const result = await response.json()

    recordIds.push(result.data.id)

    expect(response.status).toBe(201)
    expect(result.data.attributes).toEqual(expect.objectContaining(body.data.attributes))
  })

  test('should throw validation error', async () => {
    const body = {
      data: {
        type: 'project',
        attributes: {
          start_date: new Date().toISOString()
        }
      }
    }

    const response = await fetch(`${URL}/projects`, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/vnd.api+json'
      }
    })

    const result = await response.json()

    expect(response.status).toBe(400)
    expect(result).toEqual({ title: 'name: is a required property', status: 400 })
  })
})

describe('GET many', () => {
  test('should return many projects', async () => {
    const records = [{
      name: 'Skunk Works',
      start_date: new Date().toISOString()
    }, {
      name: 'The Montauk Project',
      start_date: new Date().toISOString()
    }, {
      name: 'Dunder Mifflin Paper',
      start_date: new Date().toISOString()
    }]
    const savedRecords = await Project.query().insertGraph(records)

    recordIds.push(...savedRecords.map(({ id }) => id))

    const response = await fetch(`${URL}/projects`, {
      headers: {
        'Content-Type': 'application/vnd.api+json'
      }
    })

    const result = await response.json()

    records.forEach(record => {
      expect(result.data).toEqual(expect.arrayContaining(
        [expect.objectContaining({ attributes: expect.objectContaining(record) })]
      ))
    })
  })
})

describe('GET one', () => {
  test('should return a project', async () => {
    const record = {
      id: '3de0fe0c-9d74-4f6e-b0d0-5ab435f5f472',
      name: 'Veridian Dynamics',
      start_date: new Date().toISOString()
    }
    await Project.query().insert(record)

    recordIds.push(record.id)

    const response = await fetch(`${URL}/projects/${record.id}`, {
      headers: {
        'Content-Type': 'application/vnd.api+json'
      }
    })

    const result = await response.json()
    expect(result.data.id).toBe(record.id)

    expect(result.data.attributes).toEqual(expect.objectContaining({ name: record.name, start_date: record.start_date }))
  })
})

describe('PATCH', () => {
  test('should update a project record', async () => {
    const record = {
      id: '65c091c0-d4f9-4ce0-bf44-ba00cd9b0ac3',
      name: 'Evil Corp',
      start_date: new Date().toISOString()
    }
    await Project.query().insert(record)

    recordIds.push(record.id)

    const body = {
      data: {
        type: 'project',
        attributes: {
          name: 'Not Evil Corp (really!)'
        }
      }
    }
    const response = await fetch(`${URL}/projects/${record.id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/vnd.api+json'
      }
    })

    const result = await response.json()

    expect(response.status).toBe(200)
    expect(result.data.attributes).toEqual(expect.objectContaining(body.data.attributes))
  })

  test('should unset field', async () => {
    const record = {
      id: '65c091c0-d4f9-4ce0-bf44-ba00cd9b0ac3',
      name: 'Evil Corp',
      start_date: new Date().toISOString(),
      end_date: new Date().toISOString()
    }
    await Project.query().insert(record)

    recordIds.push(record.id)

    const body = {
      data: {
        type: 'project',
        attributes: {
          end_date: null
        }
      }
    }

    const response = await fetch(`${URL}/projects/${record.id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/vnd.api+json'
      }
    })

    const result = await response.json()

    expect(response.status).toBe(200)
    expect(result.data.attributes).toEqual(expect.objectContaining(body.data.attributes))
  })
})

describe('DELETE', () => {
  test('should delete record', async () => {
    const record = {
      id: '10c6ff63-f9cd-4856-a348-a9f719e1def4',
      name: 'Evil Corp',
      start_date: new Date().toISOString(),
      end_date: new Date().toISOString()
    }
    await Project.query().insert(record)

    recordIds.push(record.id)

    const response = await fetch(`${URL}/projects/${record.id}`, {
      method: 'DELETE'
    })

    const result = await response.text()

    expect(result).toBe('')
    expect(response.status).toBe(204)
  })

  test('should return 404', async () => {
    const response = await fetch(`${URL}/projects/ba0ad8bd-08b1-4229-bab1-9657e3453ea8`, {
      method: 'DELETE'
    })

    const result = await response.text()

    expect(result).toBe('')
    expect(response.status).toBe(404)
  })
})
