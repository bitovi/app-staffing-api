const fetch = require('node-fetch')
const config = require('../../src/config')
const Role = require('../../src/models/role')

const { start, stop } = require('../../src/server')
const URL = `http://localhost:${config.get('APP_PORT')}/roles`

let roleIdsToDelete = []

beforeAll(async () => {
  await start()
})

afterAll(async () => {
  await stop()
})

afterEach(async () => {
  await Role.query().whereIn('id', roleIdsToDelete).delete()
  roleIdsToDelete = []
})

describe('Role Component Tests', () => {
  describe('POST', () => {
    it('should create role', async () => {
      const testBody = {
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
        body: JSON.stringify(testBody),
        method: 'POST',
        headers: {
          'Content-Type': 'application/vnd.api+json',
          Accept: 'application/vnd.api+json'
        }
      })

      expect(response.status).toEqual(201)

      const result = await response.json()

      roleIdsToDelete.push(result.data.id)

      expect(result.data.attributes).toEqual(testBody.data.attributes)
    })

    it('should return 500 when no project_id is present on body', async () => {
      const testBody = {
        data: {
          type: 'role',
          attributes: {
            start_date: '2021-11-02',
            start_confidence: 1,
            end_date: '2021-11-03',
            end_confidence: 5
          }
        }
      }

      const response = await fetch(URL, {
        body: JSON.stringify(testBody),
        method: 'POST',
        headers: {
          'Content-Type': 'application/vnd.api+json',
          Accept: 'application/vnd.api+json'
        }
      })

      expect(response.status).toEqual(400)
    })
  })

  describe('GET', () => {
    it('list should get all records', async () => {
      await createRoleHelper()
      const response = await fetch(URL)

      expect(response.status).toEqual(200)

      const result = await response.json()

      const roleCount = await Role.query().count()

      expect(result.data.length.toString()).toEqual(roleCount[0].count)
    })

    it('get should find record', async () => {
      await createRoleHelper()
      const testRole = (await Role.query())[0]

      const response = await fetch(`${URL}/${testRole.id}`)

      expect(response.status).toEqual(200)

      const result = await response.json()

      expect(result.data.id).toEqual(testRole.id)
    })

    it('get should return 404 when record not found', async () => {
      const fakeId = '21993255-c4cd-4e02-bc29-51ea62c62cfc'
      const response = await fetch(`${URL}/${fakeId}`)

      expect(response.status).toEqual(404)
    })
  })

  describe('PATCH', () => {
    it('should update fields', async () => {
      const testRole = await createRoleHelper()

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

    it('should return 404 when record not found', async () => {
      const role = {
        data: {
          type: 'role',
          attributes: {
            start_confidence: 999
          }
        }
      }
      const fakeId = '21993255-c4cd-4e02-bc29-51ea62c62cfc'

      const response = await fetch(`${URL}/${fakeId}`, {
        body: JSON.stringify(role),
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/vnd.api+json',
          Accept: 'application/vnd.api+json'
        }
      })

      expect(response.status).toEqual(404)
    })
  })

  describe('DELETE', () => {
    it('should delete record', async () => {
      const testRole = await createRoleHelper()

      const response = await fetch(`${URL}/${testRole.id}`, {
        method: 'DELETE'
      })

      expect(response.status).toEqual(204)

      const deletedRole = await Role.query().findById(testRole.id)

      expect(deletedRole).toBeUndefined()
    })

    it('should return 404 if record not found', async () => {
      const fakeId = '21993255-c4cd-4e02-bc29-51ea62c62cfc'
      const response = await fetch(`${URL}/${fakeId}`, {
        method: 'DELETE'
      })

      expect(response.status).toEqual(404)
    })
  })
})

/**
 * Helper to create a test role and push it to the cleanup array.
 */
const createRoleHelper = async () => {
  const testRole = {
    project_id: '21993255-c4cd-4e02-bc29-51ea62c62cfc',
    start_date: '2021-11-02',
    start_confidence: 1,
    end_date: '2021-11-03',
    end_confidence: 5
  }

  const createdRole = await Role.query().insert(testRole)
  roleIdsToDelete.push(createdRole.id)

  return createdRole
}
