/* eslint-disable no-unused-vars */
const { Model } = require('objection')
const Project = require('../../src/models/project')
const faker = require('faker')

const NUMBER_OF_RECORDS_TO_INSERT = 15

const fakesCache = new Map()

function generateAndCacheFake (keyPrefix, key, generator) {
  const prefixedKey = `${keyPrefix}.${key}`
  let value

  // retrieve value from cache by key (if provided)
  if (key) {
    value = fakesCache.get(prefixedKey)
  }

  // generate fake value via provided generator (if needed)
  if (!value) {
    value = generator()
  }

  // cache value by key (if provided)
  if (key) {
    fakesCache.set(prefixedKey, value)
  }

  return value
}

function fakeSkill (key) {
  return generateAndCacheFake(
    'skill',
    key,
    () => `${faker.random.word().toLowerCase()}.js`
  )
}

function fakeEmployee (key) {
  return generateAndCacheFake('employee', key, () =>
    faker.fake('{{name.firstName}} {{name.lastName}}')
  )
}

function fakeProject (key) {
  return generateAndCacheFake('project', key, () =>
    faker.company.companyName()
  )
}

function fakeRole (key, mixin = {}) {
  return generateAndCacheFake('role', key, () => Object.assign({}, mixin, {
    start_date: new Date(faker.date.recent()).toISOString(),
    start_confidence: faker.datatype.number(10),
    end_date: new Date(faker.date.future()).toISOString(),
    end_confidence: faker.datatype.number(10)
  }))
}

const seed = async (knex) => {
  // Give the knex instance to Objection
  Model.knex(knex)

  // delete data in reverse dependency order to avoid fk issues
  await knex('assignment').del()
  await knex('role__skill').del()
  await knex('role').del()
  await knex('project').del()
  await knex('employee__skill').del()
  await knex('employee').del()
  await knex('skill').del()

  // Generate skills

  for (let i = 0; i < NUMBER_OF_RECORDS_TO_INSERT; i++) {
    // insert seed data
    await Project.query().insertGraph([
      {
        name: fakeProject(i + 1),
        description: faker.lorem.sentences(),

        roles: [
          {
            start_date: new Date(faker.date.recent()).toISOString(),
            start_confidence: faker.datatype.float({ min: 0, max: 1, precision: 0.1 }),
            end_date: new Date(faker.date.future()).toISOString(),
            end_confidence: faker.datatype.float({ min: 0, max: 1, precision: 0.1 }),

            skills: [{
              '#id': fakeSkill(i + 1),
              name: fakeSkill(i + 1)
            }],

            assignments: [{
              start_date: new Date(faker.date.recent()).toISOString(),
              end_date: new Date(faker.date.future()).toISOString(),

              employee: {
                name: fakeEmployee(i),
                start_date: new Date(faker.date.past()).toISOString(),
                end_date: null,

                skills: [
                  {
                    '#ref': fakeSkill(i + 1)
                  }
                ]
              }
            }]
          }
        ]
      }
    ], {
      allowRefs: true,
      relate: true
    })
  }
}

module.exports = {
  fakeSkill,
  fakeEmployee,
  fakeProject,
  fakeRole,
  seed
}
