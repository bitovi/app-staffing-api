const faker = require('faker')
const map = require('lodash/map')
const range = require('lodash/range')
const isString = require('lodash/isString')
const { transaction, Model } = require('objection')

const Skill = require('../../src/models/skill')
const Employee = require('../../src/models/employee')
const { Serializer } = require('../../src/json-api-serializer')

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

  test('should return 422 if body includes id', async function () {
    const payload = Serializer.serialize('employees', {
      id: faker.datatype.uuid(),
      name: faker.name.findName()
    })
    const response = await post(payload)
    expect(response.statusCode).toBe(422)
  })

  test('should return 201 for valid employee with skills payload', async function () {
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
      start_date: faker.date.past(),
      end_date: faker.date.future(),
      skills: map(skills, 'id')
    }
    const payload = Serializer.serialize('employees', employee)
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
    const payload = Serializer.serialize('employees', {
      name: faker.name.findName(),
      start_date: faker.date.past(),
      end_date: faker.date.future(),
      skills: [faker.datatype.uuid()]
    })
    const response = await post(payload)
    expect(response.statusCode).toBe(409)
  })

  test('should return 400 if skills payload contains duplicated items', async function () {
    const skillId = faker.datatype.uuid()

    const payload = Serializer.serialize('employees', {
      name: faker.name.findName(),
      start_date: faker.date.past(),
      end_date: faker.date.future(),
      skills: [skillId, skillId, skillId]
    })
    const response = await post(payload)
    expect(response.statusCode).toBe(400)
  })

  test('should return 422 for payload with startDate after endDate', async function () {
    const skillId = faker.datatype.uuid()

    const payload = Serializer.serialize('employees', {
      name: faker.name.findName(),
      start_date: faker.date.future(),
      end_date: faker.date.past(),
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
})
