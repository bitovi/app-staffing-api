const config = require('../../src/config')
const Role = require('../../src/models/role')
const Project = require('../../src/models/project')
const Employee = require('../../src/models/employee')
const Skill = require('../../src/models/skill')
const Assignment = require('../../src/models/assignment')

const URL = `http://localhost:${config.get('APP_PORT')}/roles`

let roleIdsToDelete = []
let employeeIdsToDelete = []
let skillIdsToDelete = []
let projectIdsToDelete = []
let assignmentIdsToDelete = []

afterEach(async () => {
  await Employee.query().whereIn('id', employeeIdsToDelete).delete()
  await Assignment.query().whereIn('id', assignmentIdsToDelete).delete()
  await Skill.query().whereIn('id', skillIdsToDelete).delete()
  await Role.query().whereIn('id', roleIdsToDelete).delete()
  await Project.query().whereIn('id', projectIdsToDelete).delete()

  employeeIdsToDelete = []
  assignmentIdsToDelete = []
  skillIdsToDelete = []
  roleIdsToDelete = []
  projectIdsToDelete = []
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

    it('get should find record', async () => {
      await createRoleHelper()
      const testRole = (await Role.query())[0]

      const response = await global.app.inject({
        url: `${URL}/${testRole.id}`,
        method: 'GET'
      })

      expect(response.statusCode).toEqual(200)

      const result = JSON.parse(response.body)

      expect(result.data.id).toEqual(testRole.id)
      expect(result.data.attributes).not.toHaveProperty('skills')
      expect(result.data.attributes).not.toHaveProperty('employees')
    })

    it('get should find record with relationship skills', async () => {
      await createRoleHelper()
      const testRole = (await Role.query())[0]

      const response = await global.app.inject({
        url: `${URL}/${testRole.id}?include=skills`,
        method: 'GET'
      })

      expect(response.statusCode).toEqual(200)

      const result = JSON.parse(response.body)

      expect(result.data).toBeTruthy()
      expect(result.data.relationships).toBeTruthy()
      expect(result.data.id).toEqual(testRole.id)
      expect(result.data.relationships).toHaveProperty('skills')
      expect(result.data.relationships).not.toHaveProperty('employees')
    })

    it('get should find record with relationship employees', async () => {
      await createRoleHelper()
      const testRole = (await Role.query())[0]

      const response = await global.app.inject({
        url: `${URL}/${testRole.id}?include=employees`,
        method: 'GET'
      })

      expect(response.statusCode).toEqual(200)

      const result = JSON.parse(response.body)

      expect(result.data).toBeTruthy()
      expect(result.data.relationships).toBeTruthy()
      expect(result.data.id).toEqual(testRole.id)
      expect(result.data.relationships).not.toHaveProperty('skills')
      expect(result.data.relationships).toHaveProperty('employees')
    })

    it('get should find record with multiple relationship', async () => {
      await createRoleHelper()
      const testRole = (await Role.query())[0]

      const response = await global.app.inject({
        url: `${URL}/${testRole.id}?include=skills,employees`,
        method: 'GET'
      })

      expect(response.statusCode).toEqual(200)

      const result = JSON.parse(response.body)

      expect(result.data).toBeTruthy()
      expect(result.data.relationships).toBeTruthy()
      expect(result.data.id).toEqual(testRole.id)
      expect(result.data.relationships).toHaveProperty('skills')
      expect(result.data.relationships).toHaveProperty('employees')
    })

    it.skip('get should find record with relationship with sub relationship', async () => {
      await createRoleWithRelationsHelper()
      const testRole = (await Role.query())[0]

      const response = await global.app.inject({
        url: `${URL}/${testRole.id}?include=employees.skills`,
        method: 'GET'
      })

      expect(response.statusCode).toEqual(200)

      const result = JSON.parse(response.body)

      expect(result.data).toBeTruthy()
      expect(result.data.relationships).toBeTruthy()
      expect(result.data.id).toEqual(testRole.id)
      expect(result.data.relationships).toHaveProperty('skills')
      expect(result.data.relationships).toHaveProperty('employees')
    })

    it('get should return 404 when record not found', async () => {
      const fakeId = '21993255-c4cd-4e02-bc29-51ea62c62cfc'
      const response = await global.app.inject({
        url: `${URL}/${fakeId}`,
        method: 'GET'
      })

      expect(response.statusCode).toEqual(404)
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
      const testRole = await createRoleHelper()

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

const createRoleWithRelationsHelper = async () => {
  const createdEmployee = await Employee.query().insert(
    {
      name: 'Test User',
      start_date: '2016-01-01',
      end_date: null
    }
  )

  employeeIdsToDelete.push(createdEmployee.id)

  const createdSkill = await Skill.query().insert({
    name: 'my-test-skill.js'
  })

  skillIdsToDelete.push(createdSkill.id)

  await Project.query().insert({
    name: 'Test Project',
    start_date: new Date().toDateString(),
    end_date: new Date().toDateString()
  })

  // const createdAssignment = await Assignment.query.insert({
  //   role_id: createdRole.id,
  //   employee_id: createdEmployee.id,
  //   start_date: '2022-03-01',
  //   end_date: '2022-03-01'
  // })

  await Skill.raw(`INSERT INTO employee__skill (employee_id, skill_id) VALUES (${createdEmployee.id}, ${createdSkill.id});`)

  return {}
}
