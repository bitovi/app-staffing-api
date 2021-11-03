/* eslint-disable camelcase */

const Employee = require('../../src/models/employee')
const Project = require('../../src/models/project')
const Role = require('../../src/models/role')
const Assignment = require('../../src/models/assignment')
const faker = require('faker')
const { fakeRole } = require('../../db/seeds/dev-seed')

const config = require('../../src/config')

const URL = `http://localhost:${config.get('APP_PORT')}/assignments`

const idsToDelete = []
let project
let employee
let role

beforeAll(async () => {
  project = await Project.query().insert({
    name: faker.company.companyName(),
    start_date: new Date()
  })
  const roleData = fakeRole(1, { project_id: project.id })
  role = await Role.query().insert(roleData)
  employee = await Employee.query().insert({ name: 'Scuba Steve' })
})
afterAll(async () => {
  await Role.query().whereIn('id', [role.id]).delete()
  await Project.query().whereIn('id', [project.id]).delete()
  await Employee.query().whereIn('id', [employee.id]).delete()
  await Assignment.query().delete()
})
afterEach(async () => {
  await Assignment.query().whereIn('id', idsToDelete).delete()
})

describe('Assignment Component Tests', () => {
  describe('POST', () => {
    it('should create assignment', async () => {
      const employee_id = await getEmployeeId()
      const role_id = await getRoleId()

      // const employees = await Employee.query()
      const testBody = {
        data: {
          type: 'assignments',
          attributes: {
            employee_id,
            role_id,
            start_date: '2021-06-30T09:39:13.985Z',
            end_date: '2022-06-30T09:39:13.985Z'
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

      idsToDelete.push(result.data.id)

      expect(result.data.attributes).toEqual(testBody.data.attributes)
    })

    it('should return 500 when no project_id is present on body', async () => {
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
    it('list should get all records', async () => {
      await createAssignment()
      const response = await global.app.inject({
        url: URL,
        method: 'GET'
      })

      expect(response.statusCode).toEqual(200)

      const result = JSON.parse(response.body)

      const count = await Assignment.query().count()

      expect(result.data.length.toString()).toEqual(count[0].count)
    })

    it('list with include', async () => {
      await createAssignment()
      const response = await global.app.inject({
        url: `${URL}?include=roles,employees`,
        method: 'GET'
      })

      expect(response.statusCode).toEqual(200)

      const result = JSON.parse(response.body)

      const count = await Assignment.query().count()

      expect(result.data.length.toString()).toEqual(count[0].count)
    })

    it('get should find record', async () => {
      await createAssignment()
      const testRecord = (await Assignment.query())[0]

      const response = await global.app.inject({
        url: `${URL}/${testRecord.id}`,
        method: 'GET'
      })

      expect(response.statusCode).toEqual(200)

      const result = JSON.parse(response.body)

      expect(result.data.id).toEqual(testRecord.id)
    })

    it('get should return 404 when record not found', async () => {
      const fakeId = '21993255-c4cd-4e02-bc29-51ea62c62cfc'
      const response = await global.app.inject({
        url: `${URL}/${fakeId}`,
        method: 'GET'
      })

      expect(response.statusCode).toEqual(404)
    })

    it('get with include', async () => {
      await createAssignment()
      const testRecord = (await Assignment.query())[0]

      const response = await global.app.inject({
        url: `${URL}/${testRecord.id}?include=roles,employees`,
        method: 'GET'
      })

      expect(response.statusCode).toEqual(200)

      const result = JSON.parse(response.body)

      expect(result.included.map(i => i.type)).toEqual(['employees', 'roles'])
    })
  })

  describe('PATCH', () => {
    it('should update fields', async () => {
      const testRecord = await createAssignment()

      const start_date = '2000-06-30T09:39:13.985Z'
      const data = {
        data: {
          type: 'assignments',
          attributes: { start_date }
        }
      }

      const response = await global.app.inject({
        url: `${URL}/${testRecord.id}`,
        body: JSON.stringify(data),
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/vnd.api+json',
          Accept: 'application/vnd.api+json'
        }
      })

      expect(response.statusCode).toEqual(200)

      const result = JSON.parse(response.body)

      expect(result.data.attributes.start_date).toEqual(start_date)
    })

    it('should return 404 when record not found', async () => {
      const start_date = '2000-06-30T09:39:13.985Z'
      const role = {
        data: {
          type: 'roles',
          attributes: {
            start_date
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
    it('should delete record', async () => {
      const testRole = await createAssignment()

      const response = await global.app.inject({
        url: `${URL}/${testRole.id}`,
        method: 'DELETE'
      })

      expect(response.statusCode).toEqual(204)

      const deletedRole = await Role.query().findById(testRole.id)

      expect(deletedRole).toBeUndefined()
    })

    it('should return 404 if record not found', async () => {
      const fakeId = '21993255-c4cd-4e02-bc29-51ea62c62cfc'
      const response = await global.app.inject({
        url: `${URL}/${fakeId}`,
        method: 'DELETE'
      })

      expect(response.statusCode).toEqual(404)
    })
  })
})

/**
 * Helper to create a test role and push it to the cleanup array.
 */
const createAssignment = async () => {
  const employee_id = await getEmployeeId()
  const role_id = await getRoleId()
  const data = {
    employee_id,
    role_id,
    start_date: '2021-06-30T09:39:13.985Z',
    end_date: '2022-06-30T09:39:13.985Z'
  }

  const record = await Assignment.query().insert(data)
  idsToDelete.push(record.id)

  return record
}

const getRoleId = async () => {
  const records = await Role.query()
  return records[0].id
}
const getEmployeeId = async () => {
  const records = await Employee.query()
  return records[0].id
}
