const faker = require('faker')
const { transaction, Model } = require('objection')
const Skill = require('../../src/models/skill')
const { Serializer } = require('../../src/json-api-serializer')

describe('POST /skills', function () {
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

  test('should return 201 for valid payload', async function () {
    const payload = serialize({
      name: faker.random.words()
    })
    const response = await post(payload)
    expect(response.statusCode).toBe(201)
  })
  test('should return 422 for empty payload', async function () {
    const payload = serialize({})
    const response = await post(payload)
    expect(response.statusCode).toBe(422)
  })
  test('should return 500 for non-unique name', async function () {
    const name = faker.random.word()
    await Skill.query().insert({
      name: name
    })
    const payload = serialize({
      name: name
    })
    const response = await post(payload)
    expect(response.statusCode).toBe(409)
  })

  function post (payload) {
    return global.app.inject({
      method: 'POST',
      url: '/skills',
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
