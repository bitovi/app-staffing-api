const faker = require('faker')
const { transaction, Model } = require('objection')

const Project = require('../../src/models/project')
const { Serializer } = require('../../src/json-api-serializer')

describe('POST /projects', function () {
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

  test('should return 201 and create project with description', async function () {
    const project = {
      name: faker.name.findName(),
      description: faker.lorem.sentences()
    }

    const payload = Serializer.serialize('projects', project)
    const response = await post(payload)
    expect(response.statusCode).toBe(201)

    const responseBody = Serializer.deserialize(
      'projects',
      JSON.parse(response.body)
    )
    expect(responseBody.name).toEqual(project.name)
    expect(responseBody.description).toEqual(project.description)

    const dbProject = await Project.query().findById(responseBody.id)
    expect(dbProject.name).toEqual(project.name)
    expect(dbProject.description).toEqual(project.description)
  })

  function post (payload) {
    return global.app.inject({
      method: 'POST',
      url: '/projects',
      headers: {
        'Content-Type': 'application/vnd.api+json',
        Accept: 'application/vnd.api+json'
      },
      payload: JSON.stringify(payload)
    })
  }
})
