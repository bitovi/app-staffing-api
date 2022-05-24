const faker = require('faker')
const param = require('can-param')
const range = require('lodash/range')
const { transaction, Model } = require('objection')

const Role = require('../../src/models/role')
const Project = require('../../src/models/project')
const { Serializer } = require('../../src/json-api-serializer')
const { dateGenerator } = require('../../src/utils/date-utils')

describe('GET /roles', function () {
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

  test('should filter by project_id', async function () {
    const dates = dateGenerator()

    const projectA = await Project.query().insert({
      name: faker.company.companyName(),
      description: faker.lorem.sentences()
    })

    const projectB = await Project.query().insert({
      name: faker.company.companyName(),
      description: faker.lorem.sentences()
    })

    const projectARolesTotal = 5
    const projectBRolesTotal = 3

    await Promise.all(
      range(projectARolesTotal).map(() => {
        return Role.query().insert({
          start_date: dates.startDate,
          start_confidence: faker.datatype.float({ min: 0, max: 1, precision }),
          end_date: dates.endDate,
          end_confidence: faker.datatype.float({ min: 0, max: 1, precision }),
          project_id: projectA.id
        })
      })
    )

    await Promise.all(
      range(projectBRolesTotal).map(() => {
        return Role.query().insert({
          start_date: dates.beforeStartDate,
          start_confidence: faker.datatype.float({ min: 0, max: 1, precision }),
          end_date: dates.afterRoleEndDate,
          end_confidence: faker.datatype.float({ min: 0, max: 1, precision }),
          project_id: projectB.id
        })
      })
    )

    const responseA = await get({
      qs: param({
        filter: { project_id: { $eq: projectA.id } }
      })
    })
    expect(responseA.statusCode).toEqual(200)
    const projectARoles = deserialize(await responseA.json())
    expect(projectARoles).toHaveLength(projectARolesTotal)

    const responseB = await get({
      qs: param({
        filter: { project_id: { $eq: projectB.id } }
      })
    })
    expect(responseB.statusCode).toEqual(200)
    const projectBRoles = deserialize(await responseB.json())
    expect(projectBRoles).toHaveLength(projectBRolesTotal)
  })

  function get ({ qs }) {
    return global.app.inject({
      method: 'GET',
      url: `/roles?${qs}`,
      headers: {
        'Content-Type': 'application/vnd.api+json',
        Accept: 'application/vnd.api+json'
      }
    })
  }

  function deserialize (obj) {
    return Serializer.deserialize('roles', obj)
  }
})
