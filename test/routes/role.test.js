const config = require('../../src/config')
const Role = require('../../src/models/role')

const URL = `http://localhost:${config.get('APP_PORT')}/roles`

const roleIdsToDelete = []

afterEach(async () => {
  await Role.query().whereIn('id', roleIdsToDelete).delete()
})

describe('Role Component Tests', () => {

  afterEach(async () => {
    await Role.query().whereIn('id', roleIdsToDelete).delete()
  })

  describe('POST', () => {

    test('should create role', async () => {
      const testBody = {
        data: {
          type: 'roles',
          attributes: {
            project_id: '21993255-c4cd-4e02-bc29-51ea62c62cfc',
            start_date: '2021-11-02',
            start_confidence: 1,
            end_date: '2021-11-03',
            end_confidence: 5
          }
        }
      }
      const response = await global.app.inject({
        url: URL,
        body: JSON.stringify(testBody),
        method: 'POST',
        headers: {
          'Content-Type': 'application/vnd.api+json',
          Accept: 'application/vnd.api+json'
        }
      })
      expect(response.statusCode).toEqual(201)
      const result = JSON.parse(response.body)
      roleIdsToDelete.push(result.data.id)
      expect(result.data.attributes).toEqual(testBody.data.attributes)
    })

    test('should return 500 when no project_id is present on body', async () => {
      const testBody = {
        data: {
          type: 'roles',
          attributes: {
            start_date: '2021-11-02',
            start_confidence: 1,
            end_date: '2021-11-03',
            end_confidence: 5
          }
        }
      }
      const response = await global.app.inject({
        url: URL,
        body: JSON.stringify(testBody),
        method: 'POST',
        headers: {
          'Content-Type': 'application/vnd.api+json',
          Accept: 'application/vnd.api+json'
        }
      })
      expect(response.statusCode).toEqual(400)
    })
  })

  describe('GET', () => {

      test('gets all records', async () => {
        await createRoleHelper()
        const response = await global.app.inject({
          url: URL,
          method: 'GET'
        })
        expect(response.statusCode).toEqual(200)
        const result = JSON.parse(response.body)
        const roleCount = await Role.query().count()
        expect(result.data.length.toString()).toEqual(roleCount[0].count)
      })

      test('paginates by limit', async () => {
        await createRoleHelper()
        const response = await global.app.inject({
          url: `${URL}?page[limit]=1&page[offset]=0`,
          method: 'GET',
        })
        expect(response.statusCode).toEqual(200)
        const result = JSON.parse(response.body)
        expect(result.data.length).toEqual(1)
      })

      test('paginates by offset', async () => {
        await createRoleHelper()
        const response = await global.app.inject({
          url: `${URL}?page[limit]=100&page[offset]=1000000`,
          method: 'GET',
        })
        expect(response.statusCode).toEqual(200)
        const result = JSON.parse(response.body)
        expect(result.data.length).toEqual(0)
      })

      test('orderBy start_date', async () => {
        const r1 = await createRoleHelper()
        const r2 = await createRoleHelper()
        const response = await global.app.inject({
          url: URL,
          method: 'GET',
          query: { orderBy: 'start_date' },
        })
        expect(response.statusCode).toEqual(200)
        const result = JSON.parse(response.body)
        const date1 = Date.parse(result?.data[1].attributes?.start_date)
        const date2 = Date.parse(result?.data[0].attributes?.start_date)
        expect(date1).toBeGreaterThan(date2)
      })

      test('orderBy start_date DESC', async () => {
        await createRoleHelper()
        await createRoleHelper()
        const response = await global.app.inject({
          url: URL,
          method: 'GET',
          query: { orderBy: '-start_date' },
        })
        expect(response.statusCode).toEqual(200)
        const result = JSON.parse(response.body)

        const d1 = result?.data[0]?.attributes?.start_date
        const d2 = result?.data[1]?.attributes?.start_date

        console.log(d1,"|",d2)

        const date1 = Date.parse(d1)
        const date2 = Date.parse(d2)
        expect(date1).toBeGreaterThan(date2)
      })

      test('filters by start_confidence', async () => {
        await createRoleHelper({start_confidence:1})
        await createRoleHelper({start_confidence:3})
        const response = await global.app.inject({
          url: `${URL}?filter[start_confidence]=3`,
          method: 'GET',
        })
        expect(response.statusCode).toEqual(200)
        const result = JSON.parse(response.body)
        expect(result.data.length).toBeGreaterThan(0)
        for (d in result.data) {
          expect(result.data[d].attributes.start_confidence).toEqual(3)
        }
      })

      test('explode and 500 if duplicate filter keys', async () => {
        const response = await global.app.inject({
          url: `${URL}?filter[start_confidence]=1&filter[start_confidence]=2`,
          method: 'GET',
        })
        expect(response.statusCode).toEqual(500)
      })

      test('finds a record', async () => {
        await createRoleHelper()
        const testRole = (await Role.query())[0]
        const response = await global.app.inject({
          url: `${URL}/${testRole.id}`,
          method: 'GET'
        })
        expect(response.statusCode).toEqual(200)
        const result = JSON.parse(response.body)
        expect(result.data.id).toEqual(testRole.id)
      })

      test('returns 404 when record not found', async () => {
        const fakeId = '21993255-c4cd-4e02-bc29-51ea62c62cfc'
        const response = await global.app.inject({
          url: `${URL}/${fakeId}`,
          method: 'GET'
        })
        expect(response.statusCode).toEqual(404)
      })
    })

  describe('PATCH', () => {

    test('should update fields', async () => {
      const testRole = await createRoleHelper()
      const newStartConf = (!testRole.start_confidence ? 0 : testRole.start_confidence) + 1
      const role = {
        data: {
          type: 'roles',
          attributes: {
            start_confidence: newStartConf
          }
        }
      }
      const response = await global.app.inject({
        url: `${URL}/${testRole.id}`,
        body: JSON.stringify(role),
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/vnd.api+json',
          Accept: 'application/vnd.api+json'
        }
      })
      expect(response.statusCode).toEqual(200)
      const result = JSON.parse(response.body)
      expect(result.data.attributes.start_confidence).toEqual(newStartConf)
    })

    test('should return 404 when record not found', async () => {
      const role = {
        data: {
          type: 'roles',
          attributes: {
            start_confidence: 999
          }
        }
      }
      const fakeId = '21993255-c4cd-4e02-bc29-51ea62c62cfc'
      const response = await global.app.inject({
        url: `${URL}/${fakeId}`,
        body: JSON.stringify(role),
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/vnd.api+json',
          Accept: 'application/vnd.api+json'
        }
      })
      expect(response.statusCode).toEqual(404)
    })
  })

  describe('DELETE', () => {

    test('should delete record', async () => {
      const testRole = await createRoleHelper()
      const response = await global.app.inject({
        url: `${URL}/${testRole.id}`,
        method: 'DELETE'
      })
      expect(response.statusCode).toEqual(204)
      const deletedRole = await Role.query().findById(testRole.id)
      expect(deletedRole).toBeUndefined()
    })

    test('should return 404 if record not found', async () => {
      const fakeId = '21993255-c4cd-4e02-bc29-51ea62c62cfc'
      const response = await global.app.inject({
        url: `${URL}/${fakeId}`,
        method: 'DELETE'
      })
      expect(response.statusCode).toEqual(404)
    })
  })
})

const fakeDate = () => {
  const d = new Date();
  d.setSeconds( d.getSeconds() + Math.ceil(Math.random()*60) );
  return d.toISOString()
}

/**
 * Helper to create a test role and push it to the cleanup array.
 */
const createRoleHelper = async (opts={}) => {
  const { start_confidence=1, end_confidence=1 } = opts
  const testRole = {
    project_id: '21993255-c4cd-4e02-bc29-51ea62c62cfc',
    start_date: fakeDate(),
    start_confidence: start_confidence,
    end_date: fakeDate(),
    end_confidence: Math.ceil(Math.random() * 5)
  }
  const createdRole = await Role.query().insert(testRole)
  roleIdsToDelete.push(createdRole.id)
  return createdRole
}
