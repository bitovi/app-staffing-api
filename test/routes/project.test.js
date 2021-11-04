const Project = require('../../src/models/project')
const Role = require('../../src/models/role')
const Assignment = require('../../src/models/assignment')
const Employee = require('../../src/models/employee')

const URL = '/projects'
let projectIds = []

afterEach(async () => {
  await Assignment.query().whereIn('id', ['e35f80b9-2440-4eee-b8ea-d97630f492d3']).delete()
  await Role.query().whereIn('id', ['2579ed35-f963-4d21-a460-af64269e901b']).delete()
  await Project.query().whereIn('id', projectIds).delete()
  await Employee.query().whereIn('id', ['96a0c021-81dd-4ad6-a62c-cd6bca7a7396']).delete()

  projectIds = []
})

describe('POST', () => {
  test('should create a project record', async () => {
    const body = {
      data: {
        type: 'projects',
        attributes: {
          name: 'Micheal Scott',
          start_date: new Date().toISOString(),
          end_date: new Date().toISOString()
        }
      }
    }
    const response = await global.app.inject({
      url: URL,
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/vnd.api+json'
      }
    })

    const result = JSON.parse(response.body)

    projectIds.push(result.data.id)

    expect(response.statusCode).toBe(201)
    expect(result.data.attributes).toEqual(expect.objectContaining(body.data.attributes))
  })

  test('should throw validation error', async () => {
    const body = {
      data: {
        type: 'projects',
        attributes: {
          start_date: new Date().toISOString()
        }
      }
    }

    const response = await global.app.inject({
      url: URL,
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/vnd.api+json'
      }
    })
    expect(response.statusCode).toBe(400)

    const result = JSON.parse(response.body)

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

    projectIds.push(...savedRecords.map(({ id }) => id))

    const response = await global.app.inject({
      url: URL,
      method: 'GET',
      headers: {
        'Content-Type': 'application/vnd.api+json'
      }
    })

    const result = JSON.parse(response.body)

    records.forEach(record => {
      expect(result.data).toEqual(expect.arrayContaining(
        [expect.objectContaining({ attributes: expect.objectContaining(record) })]
      ))
    })
  })
})

describe('GET one', () => {
  test('should return a project', async () => {
    const project = {
      id: '3de0fe0c-9d74-4f6e-b0d0-5ab435f5f472',
      name: 'Veridian Dynamics',
      start_date: new Date().toISOString()
    }
    await Project.query().insert(project)

    projectIds.push(project.id)

    const response = await global.app.inject({
      url: `${URL}/${project.id}`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/vnd.api+json'
      }
    })

    const result = JSON.parse(response.body)
    expect(result.data.id).toBe(project.id)

    expect(result.data.attributes).toEqual(expect.objectContaining({ name: project.name, start_date: project.start_date }))
  })

  test('should return a project with relations', async () => {
    const project = {
      id: '3de0fe0c-9d74-4f6e-b0d0-5ab435f5f471',
      name: 'Coolest project ever',
      start_date: new Date().toISOString()
    }
    const role = {
      id: '2579ed35-f963-4d21-a460-af64269e901b',
      project_id: project.id
    }
    const employee = {
      id: '96a0c021-81dd-4ad6-a62c-cd6bca7a7396',
      name: 'Emp loyee'
    }
    const assignment = {
      id: 'e35f80b9-2440-4eee-b8ea-d97630f492d3',
      employee_id: employee.id,
      role_id: role.id,
      start_date: new Date().toISOString()
    }
    await Employee.query().insert(employee)
    await Project.query().insert(project)
    await Role.query().insert(role)
    await Assignment.query().insert(assignment)

    projectIds.push(project.id)

    const response = await global.app.inject({
      url: `${URL}/${project.id}?include=roles.assignments.employees`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/vnd.api+json'
      }
    })

    const result = JSON.parse(response.body)
    expect(result.data.id).toBe(project.id)

    expect(result.data.attributes).toEqual(expect.objectContaining({ name: project.name, start_date: project.start_date }))
    expect(result.included.map(({ id }) => id).sort()).toEqual([
      '2579ed35-f963-4d21-a460-af64269e901b',
      '96a0c021-81dd-4ad6-a62c-cd6bca7a7396',
      'e35f80b9-2440-4eee-b8ea-d97630f492d3'
    ])
  })
})

describe('PATCH', () => {
  test('should update a project record', async () => {
    const project = {
      id: '65c091c0-d4f9-4ce0-bf44-ba00cd9b0ac9',
      name: 'Evil Corp',
      start_date: new Date().toISOString()
    }
    await Project.query().insert(project)

    projectIds.push(project.id)

    const body = {
      data: {
        type: 'projects',
        id: project.id,
        attributes: {
          name: 'Not Evil Corp (really!)'
        }
      }
    }
    const response = await global.app.inject({
      url: `${URL}/${project.id}`,
      method: 'PATCH',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/vnd.api+json'
      }
    })

    expect(response.statusCode).toBe(200)

    const result = JSON.parse(response.body)

    expect(result.data.attributes).toEqual(expect.objectContaining(body.data.attributes))
  })

  test('should unset field', async () => {
    const project = {
      id: '65c091c0-d4f9-4ce0-bf44-ba00cd9b0acf',
      name: 'Evil Corp',
      start_date: new Date().toISOString(),
      end_date: new Date().toISOString()
    }
    await Project.query().insert(project)

    projectIds.push(project.id)

    const body = {
      data: {
        type: 'projects',
        id: project.id,
        attributes: {
          end_date: null
        }
      }
    }

    const response = await global.app.inject({
      url: `${URL}/${project.id}`,
      method: 'PATCH',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/vnd.api+json'
      }
    })

    expect(response.statusCode).toBe(200)

    const result = JSON.parse(response.body)

    expect(result.data.attributes).toEqual(expect.objectContaining(body.data.attributes))
  })

  test('should reset relationships', async () => {
    const project = {
      id: '19dbf187-cd4f-46fd-9731-82a077310627',
      name: 'New Project',
      start_date: new Date().toISOString()
    }
    await Project.query().insert(project)

    projectIds.push(project.id)

    const body = {
      included: [
        {
          type: 'roles',
          id: '2579ed35-f963-4d21-a460-af64269e901b',
          attributes: {
            start_confidence: 3
          }
        },
        {
          type: 'assignments',
          id: 'e35f80b9-2440-4eee-b8ea-d97630f492d3',
          attributes: {
            start_date: new Date().toISOString()
          }
        },
        {
          type: 'employees',
          id: '96a0c021-81dd-4ad6-a62c-cd6bca7a7396',
          attributes: {
            name: 'kevin'
          }
        }
      ],
      data: {
        type: 'projects',
        id: '19dbf187-cd4f-46fd-9731-82a077310627',
        attributes: {
          name: 'New name'
        },
        relationships: {
          roles: {
            data: [
              {
                type: 'roles',
                id: '2579ed35-f963-4d21-a460-af64269e901b',
                relationships: {
                  assignments: {
                    data: [
                      {
                        type: 'assignments',
                        id: 'e35f80b9-2440-4eee-b8ea-d97630f492d3',
                        relationships: {
                          employees: {
                            data: [
                              {
                                type: 'employees',
                                id: '96a0c021-81dd-4ad6-a62c-cd6bca7a7396'
                              }
                            ]
                          }
                        }
                      }
                    ]
                  }
                }
              }
            ]
          }
        }
      }
    }
    const response = await global.app.inject({
      url: `${URL}/${project.id}`,
      method: 'PATCH',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/vnd.api+json'
      }
    })

    expect(response.statusCode).toBe(200)

    const result = JSON.parse(response.body)

    expect(result.data.attributes).toEqual(expect.objectContaining(body.data.attributes))
    expect(result.data.relationships.roles.data[0].id).toEqual('2579ed35-f963-4d21-a460-af64269e901b')
  })
})

describe('DELETE', () => {
  test('should delete record', async () => {
    const project = {
      id: '10c6ff63-f9cd-4856-a348-a9f719e1def4',
      name: 'Evil Corp',
      start_date: new Date().toISOString(),
      end_date: new Date().toISOString()
    }
    await Project.query().insert(project)

    projectIds.push(project.id)

    const response = await global.app.inject({
      url: `${URL}/${project.id}`,
      method: 'DELETE'
    })

    const result = response.body

    expect(result).toBe('')
    expect(response.statusCode).toBe(204)
  })

  test('should return 404', async () => {
    const response = await global.app.inject({
      url: `${URL}/ba0ad8bd-08b1-4229-bab1-9657e3453ea8`,
      method: 'DELETE'
    })

    const result = response.body

    expect(result).toBe('')
    expect(response.statusCode).toBe(404)
  })
})
