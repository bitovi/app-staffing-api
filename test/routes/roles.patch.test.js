const faker = require('faker')
const omit = require('lodash/omit')
const { transaction, Model } = require('objection')

const Role = require('../../src/models/role')
const Skill = require('../../src/models/skill')
const Project = require('../../src/models/project')
const { Serializer } = require('../../src/json-api-serializer')
const { dateGenerator } = require('../../src/utils/utils')

describe('PATCH /roles/:id', function () {
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

  test('should return 404 if role id does not exist', async function () {
    const dates = dateGenerator()
    const notFoundId = faker.datatype.uuid()
    const payload = serialize({
      id: notFoundId,
      start_date: dates.startDate,
      start_confidence: faker.datatype.float({ min: 0, max: 1, precision }),
      project: { id: faker.datatype.uuid() }
    })
    const response = await patch(notFoundId, payload)
    expect(response.statusCode).toBe(404)
  })

  test('should return 404 if associated project does not exist', async function () {
    const dates = dateGenerator()
    const project = await Project.query().insert({
      name: faker.company.companyName(),
      description: faker.lorem.sentences()
    })

    const role = await Role.query().insert({
      start_date: dates.startDate,
      end_date: dates.endDate,
      start_confidence: faker.datatype.float({ min: 0, max: 1, precision }),
      end_confidence: faker.datatype.float({ min: 0, max: 1, precision }),
      project_id: project.id
    })

    const payload = serialize({
      project: { id: faker.datatype.uuid() }
    })
    const response = await patch(role.id, payload)
    expect(response.statusCode).toEqual(404)
  })

  test('should return 404 if associated skill does not exist', async function () {
    const dates = dateGenerator()
    const project = await Project.query().insert({
      name: faker.company.companyName(),
      description: faker.lorem.sentences()
    })

    const role = await Role.query().insert({
      start_date: dates.startDate,
      end_date: dates.endDate,
      start_confidence: faker.datatype.float({ min: 0, max: 1, precision }),
      end_confidence: faker.datatype.float({ min: 0, max: 1, precision }),
      project_id: project.id
    })

    const payload = serialize({
      ...omit(role, ['project_id']),
      project: { id: project.id },
      skills: [{ id: faker.datatype.uuid() }]
    })
    const response = await patch(role.id, payload)
    expect(response.statusCode).toEqual(404)
  })

  test('should return 422 if start_confidence is negative', async function () {
    const dates = dateGenerator()
    const project = await Project.query().insert({
      name: faker.company.companyName(),
      description: faker.lorem.sentences()
    })

    const role = await Role.query().insert({
      start_date: dates.startDate,
      end_date: dates.endDate,
      start_confidence: faker.datatype.float({ min: 0, max: 1, precision }),
      end_confidence: faker.datatype.float({ min: 0, max: 1, precision }),
      project_id: project.id
    })

    const payload = serialize({
      ...omit(role, ['project_id']),
      start_confidence: -1
    })
    const response = await patch(role.id, payload)
    expect(response.statusCode).toEqual(422)
  })

  test('should return 422 if start_confidence is greater than 1', async function () {
    const dates = dateGenerator()
    const project = await Project.query().insert({
      name: faker.company.companyName(),
      description: faker.lorem.sentences()
    })

    const role = await Role.query().insert({
      start_date: dates.startDate,
      end_date: dates.endDate,
      start_confidence: faker.datatype.float({ min: 0, max: 1, precision }),
      end_confidence: faker.datatype.float({ min: 0, max: 1, precision }),
      project_id: project.id
    })

    const payload = serialize({
      ...omit(role, ['project_id']),
      start_confidence: 1.01
    })
    const response = await patch(role.id, payload)
    expect(response.statusCode).toEqual(422)
  })

  test('should return 200 if update is successful', async function () {
    const dates = dateGenerator()
    const oldProject = await Project.query().insert({
      name: faker.company.companyName(),
      description: faker.lorem.sentences()
    })

    const newProject = await Project.query().insert({
      name: faker.company.companyName(),
      description: faker.lorem.sentences()
    })

    const roleData = {
      start_date: dates.startDate,
      end_date: dates.endDate,
      start_confidence: faker.datatype.float({ min: 0, max: 1, precision }),
      end_confidence: faker.datatype.float({ min: 0, max: 1, precision }),
      project_id: oldProject.id
    }
    const role = await Role.query().insert(roleData)

    const payload = serialize({
      ...omit(roleData, ['project_id']),
      project: { id: newProject.id }
    })
    const response = await patch(role.id, payload)
    expect(response.statusCode).toEqual(200)

    const responseBody = deserialize(JSON.parse(response.body))
    expect(responseBody.project.id).toEqual(newProject.id)
  })

  test('should return 200 if skills update is successful', async function () {
    const dates = dateGenerator()
    const project = await Project.query().insert({
      name: faker.company.companyName(),
      description: faker.lorem.sentences()
    })

    const oldSkill = await Skill.query().insert({
      name: faker.lorem.word()
    })

    const newSkill = await Skill.query().insert({
      name: faker.lorem.word()
    })

    const roleData = {
      start_date: dates.startDate,
      end_date: dates.endDate,
      start_confidence: faker.datatype.float({ min: 0, max: 1, precision }),
      end_confidence: faker.datatype.float({ min: 0, max: 1, precision }),
      project: { id: project.id },
      skills: [{ id: oldSkill.id }]
    }
    const role = await Role.query().insertGraph(roleData, { relate: true })

    const payload = serialize({
      ...omit(roleData, ['project_id']),
      project: { id: project.id },
      skills: [{ id: newSkill.id }]
    })
    const response = await patch(role.id, payload)
    expect(response.statusCode).toEqual(200)

    const responseBody = deserialize(JSON.parse(response.body))
    expect(responseBody.project.id).toEqual(project.id)
    expect(responseBody.skills[0].id).toEqual(newSkill.id)
  })

  test('should allow end_date / end_confidence updates to null', async function () {
    const dates = dateGenerator()
    const project = await Project.query().insert({
      name: faker.company.companyName(),
      description: faker.lorem.sentences()
    })

    const roleData = {
      start_date: dates.startDate,
      end_date: dates.endDate,
      start_confidence: faker.datatype.float({ min: 0, max: 1, precision }),
      end_confidence: faker.datatype.float({ min: 0, max: 1, precision }),
      project_id: project.id
    }
    const role = await Role.query().insert(roleData)

    const payload = serialize({
      ...omit(roleData, ['project_id']),
      project: { id: project.id },
      end_date: null,
      end_confidence: null
    })
    const response = await patch(role.id, payload)
    expect(response.statusCode).toEqual(200)

    const responseBody = deserialize(JSON.parse(response.body))
    expect(responseBody.end_date).toBeNull()
    expect(responseBody.end_confidence).toBeNull()
  })
  test('should return 422 for payload with startDate after endDate', async function () {
    const dates = dateGenerator()
    const project = await Project.query().insert({
      name: faker.company.companyName(),
      description: faker.lorem.sentences()
    })

    const roleData = {
      start_date: dates.startDate,
      end_date: dates.endDate,
      start_confidence: faker.datatype.float({ min: 0, max: 1, precision }),
      end_confidence: faker.datatype.float({ min: 0, max: 1, precision }),
      project_id: project.id
    }
    const role = await Role.query().insert(roleData)

    const payload = serialize({
      ...omit(roleData, ['project_id']),
      project: { id: project.id },
      start_date: dates.endDate,
      end_date: dates.startDate

    })
    const response = await patch(role.id, payload)
    expect(response.statusCode).toEqual(422)
  })

  function patch (id, payload) {
    return global.app.inject({
      method: 'PATCH',
      url: `/roles/${id}`,
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

  function deserialize (obj) {
    return Serializer.deserialize('roles', obj)
  }
})
