const faker = require('faker')
const isString = require('lodash/isString')
const { transaction, Model } = require('objection')

const Role = require('../../src/models/role')
const Skill = require('../../src/models/skill')
const Project = require('../../src/models/project')
const { Serializer } = require('../../src/json-api-serializer')

describe('POST /roles', function () {
  let trx
  const knex = Model.knex()
  const precision = 0.1

  beforeEach(async () => {
    trx = await transaction.start(knex)
    Model.knex(trx)
  })

  afterEach(async () => {
    await trx.rollback()
    Model.knex(knex)
  })

  test('should return 403 if payload body includes id', async function () {
    const payload = serialize({
      id: faker.datatype.uuid(),
      project: { id: faker.datatype.uuid() },
      start_date: faker.date.future(),
      start_confidence: faker.datatype.float({ min: 0, max: 1, precision })
    })
    const response = await post(payload)
    expect(response.statusCode).toBe(403)
  })

  test('should return 422 if payload is missing start_date', async function () {
    const payload = serialize({
      start_confidence: faker.datatype.float({ min: 0, max: 1, precision }),
      project: { id: faker.datatype.uuid() }
    })
    const response = await post(payload)
    expect(response.statusCode).toBe(422)

    const body = JSON.parse(response.body)
    expect(body.title).toEqual("body should have required property 'start_date'")
  })

  test('should return 422 if payload is missing start_confidence', async function () {
    const payload = serialize({
      start_date: faker.date.future(),
      project: { id: faker.datatype.uuid() }
    })
    const response = await post(payload)
    expect(response.statusCode).toBe(422)

    const body = JSON.parse(response.body)
    expect(body.title).toEqual(
      "body should have required property 'start_confidence'"
    )
  })

  test('should return 422 if start_confidence is negative', async function () {
    const payload = serialize({
      start_date: faker.date.future(),
      project: { id: faker.datatype.uuid() },
      start_confidence: -1
    })
    const response = await post(payload)
    expect(response.statusCode).toBe(422)

    const body = JSON.parse(response.body)
    expect(body.title).toEqual('body.start_confidence should be >= 0')
  })

  test('should return 422 if start_confidence is greater than 1', async function () {
    const payload = serialize({
      start_date: faker.date.future(),
      project: { id: faker.datatype.uuid() },
      start_confidence: 1.1
    })
    const response = await post(payload)
    expect(response.statusCode).toBe(422)

    const body = JSON.parse(response.body)
    expect(body.title).toEqual('body.start_confidence should be <= 1')
  })

  test('should return 422 if payload has unknown fields', async function () {
    const payload = serialize({
      start_date: faker.date.future(),
      start_confidence: faker.datatype.float({ min: 0, max: 1, precision }),
      project: { id: faker.datatype.uuid() },
      anUnknownField: 'foo bar baz'
    })
    const response = await post(payload)
    expect(response.statusCode).toBe(422)
  })

  test('should fail if associated project does not exist', async function () {
    const payload = serialize({
      start_date: faker.date.future(),
      start_confidence: faker.datatype.float({ min: 0, max: 1, precision }),
      project: { id: faker.datatype.uuid() }
    })
    const response = await post(payload)
    expect(response.statusCode).toBe(500)
  })

  test('should fail if associated skill does not exist', async function () {
    const project = await Project.query().insert({
      name: faker.company.companyName(),
      description: faker.lorem.sentences()
    })

    const newRole = {
      start_date: faker.date.future(),
      start_confidence: faker.datatype.float({ min: 0, max: 1, precision }),
      project: { id: project.id },
      skills: [{ id: faker.datatype.uuid() }]
    }
    const payload = serialize(newRole)
    const response = await post(payload)
    expect(response.statusCode).toBe(500)
  })

  test('should return 201 for valid payload', async function () {
    const project = await Project.query().insert({
      name: faker.company.companyName(),
      description: faker.lorem.sentences()
    })

    const newRole = {
      start_date: faker.date.future(),
      start_confidence: faker.datatype.float({ min: 0, max: 1, precision }),
      project: { id: project.id }
    }
    const payload = serialize(newRole)
    const response = await post(payload)
    expect(response.statusCode).toBe(201)

    const body = JSON.parse(response.body)
    expect(isString(body.data.id)).toEqual(true)

    const savedRole = await Role.query().findById(body.data.id)
    expect(savedRole.project_id).toEqual(newRole.project.id)
    expect(savedRole.start_date).toEqual(newRole.start_date)
    expect(savedRole.start_confidence).toEqual(newRole.start_confidence)
  })

  test('should return 201 for valid payload with skills', async function () {
    const project = await Project.query().insert({
      name: faker.company.companyName(),
      description: faker.lorem.sentences()
    })

    const skill = await Skill.query().insert({
      name: faker.lorem.word()
    })

    const newRole = {
      start_date: faker.date.future(),
      start_confidence: faker.datatype.float({ min: 0, max: 1, precision }),
      project: { id: project.id },
      skills: [skill]
    }
    const payload = serialize(newRole)
    const response = await post(payload)
    expect(response.statusCode).toBe(201)

    const body = JSON.parse(response.body)
    expect(isString(body.data.id)).toEqual(true)

    const savedRole = await Role.query().findById(body.data.id)
    expect(savedRole.project_id).toEqual(newRole.project.id)
    expect(savedRole.start_date).toEqual(newRole.start_date)
    expect(savedRole.start_confidence).toEqual(newRole.start_confidence)

    const savedRoleSkills = await savedRole.$relatedQuery('skills')
    expect(savedRoleSkills.length).toEqual(1)
    expect(savedRoleSkills[0].id).toEqual(skill.id)
  })
  test('should return 422 for payload with startDate after endDate', async function () {
    const project = await Project.query().insert({
      name: faker.company.companyName(),
      description: faker.lorem.sentences()
    })

    const skill = await Skill.query().insert({
      name: faker.lorem.word()
    })

    const newRole = {
      start_date: faker.date.future(),
      start_confidence: faker.datatype.float({ min: 0, max: 1, precision }),
      end_date: faker.date.past(),
      end_confidence: faker.datatype.float({ min: 0, max: 1, precision }),
      project: { id: project.id },
      skills: [skill]
    }
    const payload = serialize(newRole)
    const response = await post(payload)
    expect(response.statusCode).toBe(422)
  })

  function post (payload) {
    return global.app.inject({
      method: 'POST',
      url: '/roles',
      headers: {
        'Content-Type': 'application/vnd.api+json',
        Accept: 'application/vnd.api+json'
      },
      payload: JSON.stringify(payload)
    })
  }

  function serialize (obj) {
    return Serializer.serialize('roles', obj)
  }
})
