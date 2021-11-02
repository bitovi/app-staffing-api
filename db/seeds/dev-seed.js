/* eslint-disable no-unused-vars */
const { Model } = require('objection')
const Project = require('../../src/models/project')
const faker = require('faker')

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

exports.seed = async (knex) => {
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

  // insert seed data
  await Project.query().insertGraph([
    {
      name: fakeProject(),
      start_date: new Date(),
      end_date: new Date(),

      roles: [
        {
          start_date: new Date(faker.date.recent()),
          start_confidence: faker.datatype.number(10),
          end_date: new Date(faker.date.future()),
          end_confidence: faker.datatype.number(10),

          skills: {
            '#id': fakeSkill(1),
            name: fakeSkill(1)
          },

          assignments: [{
            start_date: new Date(faker.date.recent()),
            end_date: new Date(faker.date.future()),

            employee: {
              name: fakeEmployee(1),
              start_date: new Date(faker.date.past()),
              end_date: null,

              skills: [
                {
                  '#ref': fakeSkill(1)
                }
              ]
            }
          }]
        }
      ]
    }
    // more projects
  ], { allowRefs: true })
}
