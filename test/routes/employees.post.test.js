const faker = require('faker')
const map = require('lodash/map')
const range = require('lodash/range')
const isString = require('lodash/isString')
const { transaction, Model } = require('objection')

const Skill = require('../../src/models/skill')
const Employee = require('../../src/models/employee')
const { Serializer } = require('../../src/json-api-serializer')
const { dateGenerator } = require('../../src/utils/date-utils')

describe('POST /employees', function () {
  let trx
  const knex = Model.knex()

  beforeEach(async () => {
    trx = await transaction.start(knex)
    Model.knex(trx)
  })

  afterEach(async () => {
    await trx.rollback()
    Model.knex(knex)
  })

  test('should return 403 if body includes id', async function () {
    const payload = serialize({
      id: faker.datatype.uuid(),
      name: faker.name.findName()
    })
    const response = await post(payload)
    expect(response.statusCode).toBe(403)
  })

  test('should return 201 for valid employee with skills payload', async function () {
    const dates = dateGenerator()

    // create some skills records
    const howManySkills = 3
    const skills = await Skill.query()
      .insert(
        range(howManySkills).map(() => ({
          name: faker.lorem.word()
        }))
      )
      .returning('*')

    const employee = {
      name: faker.name.findName(),
      start_date: dates.startDate,
      end_date: dates.endDate,
      skills: map(skills, 'id')
    }
    const payload = serialize(employee)
    const response = await post(payload)
    expect(response.statusCode).toBe(201)

    const body = JSON.parse(response.body)
    expect(isString(body.data.id)).toBe(true)

    const savedEmployee = await Employee.query().findById(body.data.id)
    expect(savedEmployee.name).toBe(employee.name)

    const savedEmployeeSkills = await savedEmployee.$relatedQuery('skills')
    expect(savedEmployeeSkills.length).toBe(employee.skills.length)
    expect(map(savedEmployeeSkills, 'id')).toEqual(
      expect.arrayContaining(employee.skills)
    )
  })

  test('should fail if skill id does not exist', async function () {
    const dates = dateGenerator()

    const payload = serialize({
      name: faker.name.findName(),
      start_date: dates.startDate,
      end_date: dates.endDate,
      skills: [faker.datatype.uuid()]
    })
    const response = await post(payload)
    expect(response.statusCode).toBe(500)
  })

  test('should return 422 if skills payload contains duplicated items', async function () {
    const dates = dateGenerator()
    const skillId = faker.datatype.uuid()

    const payload = serialize({
      name: faker.name.findName(),
      start_date: dates.startDate,
      end_date: dates.endDate,
      skills: [skillId, skillId, skillId]
    })
    const response = await post(payload)
    expect(response.statusCode).toBe(422)
  })
  test('should return 422 for payload with startDate after endDate', async function () {
    const dates = dateGenerator()
    const skillId = faker.datatype.uuid()

    const payload = serialize({
      name: faker.name.findName(),
      start_date: dates.endDate,
      end_date: dates.startDate,
      skills: [skillId]
    })
    const response = await post(payload)
    expect(response.statusCode).toBe(422)
  })

  function post (payload) {
    return global.app.inject({
      method: 'POST',
      url: '/employees',
      headers: {
        'Content-Type': 'application/vnd.api+json',
        Accept: 'application/vnd.api+json'
      },
      payload: JSON.stringify(payload)
    })
  }
  function serialize (obj) {
    return Serializer.serialize('employees', obj)
  }
})
