const faker = require('faker')
const { transaction, Model } = require('objection')
const Skill = require('../../src/models/skill')
const { Serializer } = require('../../src/json-api-serializer')

describe('PATCH /skills/:id', function () {
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

  test('should return 200 if update is successful', async function () {
    const oldSkill = await Skill.query().insert({ name: faker.random.word() })
    const payload = serialize({
      name: faker.random.word()
    })
    const response = await patch(oldSkill.id, payload)
    expect(response.statusCode).toBe(200)
  })
  test('should return 422 if payload is empty', async function () {
    const oldSkill = await Skill.query().insert({ name: faker.random.word() })
    const payload = serialize({
    })
    const response = await patch(oldSkill.id, payload)
    expect(response.statusCode).toBe(422)
  })
  test('should return 404 if payload has non-unique name', async function () {
    const oldSkill = await Skill.query().insert({ name: faker.random.word() })
    const skill = await Skill.query().insert({ name: faker.random.word() })
    const payload = serialize({
      name: skill.name
    })
    const response = await patch(oldSkill.id, payload)
    expect(response.statusCode).toBe(404)
  })
  function patch (id, payload) {
    return global.app.inject({
      method: 'PATCH',
      url: `/skills/${id}`,
      headers: {
        'Content-Type': 'application/vnd.api+json',
        Accept: 'application/vnd.api+json'
      },
      payload: JSON.stringify(payload)
    })
  }

  function serialize (obj) {
    return Serializer.serialize('skills', obj)
  }
})
