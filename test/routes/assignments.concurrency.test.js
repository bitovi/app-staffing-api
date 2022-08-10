const faker = require('faker')

const Role = require('../../src/models/role')
const Project = require('../../src/models/project')
const Employee = require('../../src/models/employee')
const Assignment = require('../../src/models/assignment')
const { Serializer } = require('../../src/json-api-serializer')
const { dateGenerator } = require('../../src/utils/date-utils')

describe('Overlapping assignments are prevented while multiple records are inserted at the same time', function () {
  const idList = []
  let project, role, employee
  const dates = dateGenerator()

  beforeAll(async () => {
    project = await Project.query().insert({
      name: faker.company.companyName(),
      description: faker.lorem.sentences()
    })
    employee = await Employee.query().insert({
      name: faker.name.findName(),
      start_date: dates.startDate,
      end_date: dates.endDate
    })
    role = await Role.query().insert({
      start_date: dates.beforeStartDate,
      start_confidence: faker.datatype.float({ min: 0, max: 1 }),
      end_date: dates.afterEndDate,
      end_confidence: faker.datatype.float({ min: 0, max: 1 }),
      project_id: project.id
    })
  })

  afterAll(async () => {
    await Promise.all([
      Project.query().findById(project.id).delete(),
      Employee.query().findById(employee.id).delete(),
      Role.query().findById(role.id).delete(),
      deleteIds(idList)
    ])
  })

  test.concurrent.each([
    [
      'insert is successful, should return 201',
      dates.startDate,
      dates.endAssignmentDate,
      201
    ],
    [
      'overlap detected, should return 409',
      dates.startDate,
      dates.endAfterAssignmentDate,
      409
    ],
    [
      'overlap detected, should return 409',
      dates.startDate,
      dates.endDate,
      409
    ]
  ])('%s', async (title, start, end, expected) => {
    const newAssignment = {
      start_date: start,
      end_date: end,
      employee: { id: employee.id },
      role: { id: role.id }
    }
    const payload = serialize(newAssignment)
    const response = await post(payload)
    if (response.statusCode === 201) { idList.push(response.headers.location.split('/')[2]) }
    expect(response.statusCode).toEqual(expected)
  })

  function post (payload) {
    return global.app.inject({
      method: 'POST',
      url: '/assignments',
      headers: {
        'Content-Type': 'application/vnd.api+json',
        Accept: 'application/vnd.api+json'
      },
      payload: JSON.stringify(payload)
    })
  }

  function serialize (obj) {
    return Serializer.serialize('assignments', obj)
  }
})
describe('Overlapping assignments are prevented while multiple records are updated concurrently', function () {
  const idList = []
  let project, role, employee, assignment, newAssignment
  const dates = dateGenerator()

  beforeAll(async () => {
    [project, employee] = await Promise.all([
      Project.query().insert({
        name: faker.company.companyName(),
        description: faker.lorem.sentences()
      }),
      Employee.query().insert({
        name: faker.name.findName(),
        start_date: faker.date.past(),
        end_date: faker.date.future()
      })
    ])

    role = await Role.query().insert({
      start_date: dates.beforeStartDate,
      start_confidence: faker.datatype.float({ min: 0, max: 1 }),
      end_date: dates.afterEndDate,
      end_confidence: faker.datatype.float({ min: 0, max: 1 }),
      project_id: project.id
    })

    newAssignment = {
      start_date: dates.startAssignmentDate,
      end_date: dates.endAssignmentDate,
      employee: { id: employee.id },
      role: { id: role.id }
    }

    const promises = await Promise.all([
      Assignment.query().insertGraph(newAssignment, { relate: true }),
      Assignment.query().insert({
        start_date: dates.startDate,
        end_date: dates.startBeforeAssignmentDate,
        employee_id: employee.id,
        role_id: role.id
      })
    ])

    assignment = promises[0]
  })
  afterAll(async () => {
    await deleteIds(idList)
    await Project.query().findById(project.id).delete()
    await await Employee.query().findById(employee.id).delete()
    await Role.query().findById(role.id).delete()
    await Assignment.query().findById(assignment.id).delete()
  })

  test.concurrent.each([
    [
      'patch is successful, should return 200',
      dates.endAssignmentDate,
      dates.endAfterAssignmentDate,
      200
    ],
    [
      'overlap detected, should return 409',
      dates.beforeStartDate,
      dates.afterEndDate,
      409
    ],
    [
      'overlap detected, should return 409',
      dates.startDate,
      dates.endAssignmentDate,
      409
    ],
    ['overlap detected, should return 409', dates.startDate, null, 409]
  ])('%s', async (title, start, end, expected) => {
    const payload = serialize({
      ...newAssignment,
      start_date: start,
      end_date: end
    })
    const response = await patch(assignment.id, payload)
    if (response.statusCode === 200) { idList.push(response.payload.split(',')[3].split('"')[3]) }
    expect(response.statusCode).toEqual(expected)
  })

  function patch (id, payload) {
    return global.app.inject({
      method: 'PATCH',
      url: `/assignments/${id}`,
      headers: {
        'Content-Type': 'application/vnd.api+json',
        Accept: 'application/vnd.api+json'
      },
      payload: JSON.stringify(payload)
    })
  }

  function serialize (obj) {
    return Serializer.serialize('assignments', obj)
  }
})

async function deleteIds (idList) {
  for (const id of idList) {
    await Assignment.query().delete().where({ id: id })
  }
}
