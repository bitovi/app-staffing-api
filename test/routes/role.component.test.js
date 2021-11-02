const fetch = require('node-fetch')
const config = require('../../src/config')
const Role = require('../../src/models/role')

const { start, stop } = require('../../src/server')
const URL = `http://localhost:${config.get('APP_PORT')}/roles`

beforeAll(async () => {
  await start()
})

afterAll(async () => {
  await stop()
})

describe('Role Component Tests', () => {
  describe('POST', () => {
    it('should create role', async () => {
      const role = {
        data: {
          type: 'role',
          attributes: {
            project_id: '21993255-c4cd-4e02-bc29-51ea62c62cfc',
            start_date: '2021-11-02',
            start_confidence: 1,
            end_date: '2021-11-03',
            end_confidence: 5
          }
        }
      }

      const response = await fetch(URL, {
        body: JSON.stringify(role),
        method: 'POST',
        headers: {
          'Content-Type': 'application/vnd.api+json',
          Accept: 'application/vnd.api+json'
        }
      })

      const result = await response.json()

      expect(response.status).toEqual(201)
      expect(result.data.attributes).toEqual(role.data.attributes)
    })
  })

  describe('GET', () => {
    it('list should get all records', async () => {
      const response = await fetch(URL)

      const result = await response.json()

      const roleCount = await Role.query().count()
      expect(response.status).toEqual(200)
      expect(result.data.length.toString()).toEqual(roleCount[0].count)
    })

    it('get should find record', async () => {
      const testRole = (await Role.query())[0]

      const response = await fetch(`${URL}/${testRole.id}`)

      const result = await response.json()

      expect(result.data.id).toEqual(testRole.id)
    })
  })

  describe('PATCH', () => {
    it('should update fields', async () => {
      const testRole = (await Role.query())[0]

      const newStartConf = (!testRole.start_confidence ? 0 : testRole.start_confidence) + 1
      const role = {
        data: {
          type: 'role',
          attributes: {
            start_confidence: newStartConf
          }
        }
      }

      const response = await fetch(`${URL}/${testRole.id}`, {
        body: JSON.stringify(role),
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/vnd.api+json',
          Accept: 'application/vnd.api+json'
        }
      })

      expect(response.status).toEqual(200)

      const result = await response.json()

      expect(result.data.attributes.start_confidence).toEqual(newStartConf)
    })
  })

  describe('DELETE', () => {
    it('should delete record', async () => {
      const testRole = await Role.query().insert({
        project_id: '21993255-c4cd-4e02-bc29-51ea62c62cff'
      })

      const response = await fetch(`${URL}/${testRole.id}`, {
        method: 'DELETE'
      })

      const deletedRole = await Role.query().findById(testRole.id)

      expect(response.status).toEqual(204)
      expect(deletedRole).toBeUndefined()
    })
  })
})
