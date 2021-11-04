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
    
    it('paginates by limit', async () => {
      await createRoleHelper()
      const response = await global.app.inject({
        url: `${URL}?page[limit]=1&page[offset]=0`,
        method: 'GET',
      })
      expect(response.statusCode).toEqual(200)
      const result = JSON.parse(response.body)
      expect(result.data.length).toEqual(1)
    })

    it('paginates by offset', async () => {
      await createRoleHelper()
      const response = await global.app.inject({
        url: `${URL}?page[limit]=100&page[offset]=1000000`,
        method: 'GET',
      })
      expect(response.statusCode).toEqual(200)
      const result = JSON.parse(response.body)
      expect(result.data.length).toEqual(0)
    })

    it('orderBy start_date', async () => {
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

    it('orderBy start_date DESC', async () => {
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

    it('filters by start_confidence', async () => {
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

    it('explode and 500 if duplicate filter keys', async () => {
      const response = await global.app.inject({
        url: `${URL}?filter[start_confidence]=1&filter[start_confidence]=2`,
        method: 'GET',
      })
      expect(response.statusCode).toEqual(500)
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
    })

    it('get should find record with relationship data', async () => {
      await createRoleHelper()
      const testRole = (await Role.query())[0]

      const response = await global.app.inject({
        url: `${URL}/${testRole.id}?include=skills`,
        method: 'GET'
      })

      expect(response.statusCode).toEqual(200)

      const result = JSON.parse(response.body)

      expect(result.data).toBeTruthy()
      expect(result.data.id).toEqual(testRole.id)
      expect(result.data.relationships).toBeTruthy()
      expect(result.data.relationships).toHaveProperty('skills')
      expect(result.data.relationships).not.toHaveProperty('employees')
    })

    it('get should find record with multiple relationship data', async () => {
      await createRoleHelper()
      const testRole = (await Role.query())[0]

      const response = await global.app.inject({
        url: `${URL}/${testRole.id}?include=skills,employees`,
        method: 'GET'
      })

      expect(response.statusCode).toEqual(200)

      const result = JSON.parse(response.body)

      expect(result.data).toBeTruthy()
      expect(result.data.id).toEqual(testRole.id)
      expect(result.data.relationships).toBeTruthy()
      expect(result.data.relationships).toHaveProperty('skills')
      expect(result.data.relationships).toHaveProperty('employees')
    })

    it('get should return 404 for bad relationship value', async () => {
      await createRoleHelper()
      const testRole = (await Role.query())[0]

      const response = await global.app.inject({
        url: `${URL}/${testRole.id}?include=bad_value`,
        method: 'GET'
      })

      expect(response.statusCode).toEqual(404)
    })

    it('get should return 404 when record not found', async () => {
      const fakeId = '21993255-c4cd-4e02-bc29-51ea62c62cfc'
      const response = await global.app.inject({
        url: `${URL}/${fakeId}`,
        method: 'GET'
      })

      expect(response.statusCode).toEqual(404)
    })

    it('get should find record with relationship with sub relationship', async () => {
      const testRole = await createRoleWithRelationsHelper()

      const response = await global.app.inject({
        url: `${URL}/${testRole.id}?include=employees.skills`,
        method: 'GET'
      })

      expect(response.statusCode).toEqual(200)

      const result = response.json()

      expect(result.data).toBeTruthy()
      expect(result.data.relationships).toBeTruthy()
      expect(result.data.id).toEqual(testRole.id)
      expect(result.data.relationships).toHaveProperty('employees')
      expect(result.included.filter(el => el.type === 'employees').length).toBeTruthy()
      expect(result.included.filter(el => el.type === 'employees')[0].relationships).toBeTruthy()
      expect(result.included.filter(el => el.type === 'employees')[0].relationships).toHaveProperty('skills')
    })
  })

  describe('PATCH', () => {
    it('should update fields', async () => {
      const testRole = await createRoleHelper()

      const newStartConf = (!testRole.start_confidence ? 0 : testRole.start_confidence) + 1
      const role = {
        data: {
          type: 'roles',
          id: testRole.id,
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

      expect(response.statusCode).toEqual(204)
      const result = await Role.query().findById(testRole.id)
      expect(result.start_confidence).toEqual(newStartConf)
    })

    it('should update fields with related', async () => {
      const createdRole = await createRoleHelper()
      const createdSkill = await createSkillHelper()

      const oData = {
        data: {
          type: 'roles',
          id: createdRole.id,
          attributes: {
            start_confidence: 1,
            end_confidence: 2
          },
          relationships: {
            skills: {
              data: [
                {
                  type: 'skills',
                  id: createdSkill.id
                }
              ]
            }
          }
        }
      }

      const response = await global.app.inject({
        url: `${URL}/${createdRole.id}`,
        body: JSON.stringify(oData),
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/vnd.api+json',
          Accept: 'application/vnd.api+json'
        }
      })

      expect(response.statusCode).toEqual(204)
      const result = await Role.query().findById(createdRole.id).withGraphFetched('skills')
      expect(result).toHaveProperty('skills')
    })

    it('should return 404 when record not found', async () => {
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

const createSkillHelper = async () => {
  const createdSkill = await Skill.query().insert({
    name: 'my-test-skill.js'
  })
  skillIdsToDelete.push(createdSkill.id)

  return createdSkill
}

const createRoleWithRelationsHelper = async () => {
  const knex = Skill.knex()

  const createdEmployee = await Employee.query().insert(
    {
      name: 'Test User',
      start_date: '2016-01-01',
      end_date: null
    }
  )

  const createdSkill = await Skill.query().insert({
    name: 'my-test-skill.js'
  })

  await knex('employee__skill').insert({
    employee_id: createdEmployee.id,
    skill_id: createdSkill.id
  })

  const createdProject = await Project.query().insert({
    name: 'Test Project',
    start_date: new Date().toDateString(),
    end_date: new Date().toDateString()
  })

  const createdRole = await Role.query().insert({
    project_id: createdProject.id,
    start_date: '2021-11-02',
    start_confidence: 1,
    end_date: '2021-11-03',
    end_confidence: 5
  })

  await knex('role__skill').insert({
    role_id: createdRole.id,
    skill_id: createdSkill.id
  })

  const createdAssignment = await Assignment.query().insert({
    role_id: createdRole.id,
    employee_id: createdEmployee.id,
    start_date: '2022-03-01',
    end_date: '2022-03-01'
  })

  roleIdsToDelete.push(createdRole.id)
  employeeIdsToDelete.push(createdEmployee.id)
  skillIdsToDelete.push(createdSkill.id)
  assignmentIdsToDelete.push(createdAssignment.id)

  return createdRole
}
