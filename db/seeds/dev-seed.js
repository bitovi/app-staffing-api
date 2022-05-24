const { Model } = require('objection')
const Project = require('../../src/models/project')
const faker = require('faker')
const _ = require('lodash')
const Skill = require('../../src/models/skill')
const { dateGenerator } = require('../../src/utils/date-utils')

const NUMBER_OF_RECORDS_TO_INSERT = 15

const fakesCache = new Map()
const dates = dateGenerator()
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
async function createSkills () {
  const skillList = [
    { name: 'Product Design' },
    { name: 'Project Management' },
    { name: 'React' },
    { name: 'Angular' },
    { name: 'Backend' },
    { name: 'DevOps' }
  ]
  const skills = await Skill.query().insert(skillList)
  const idList = []
  skills.forEach((e) => {
    idList.push(e.id)
  })
  return idList
}
function getSkill (skills) {
  const rnd = _.random(5)
  return skills[rnd]
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
    start_date: dates.startDate,
    start_confidence: faker.datatype.number(10),
    end_date: dates.endDate,
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
  const skillList = await createSkills()
  for (let i = 0; i < NUMBER_OF_RECORDS_TO_INSERT; i++) {
    // insert seed data
    const skill = getSkill(skillList)
    const dates = dateGenerator()
    await Project.query().insertGraph([
      {
        name: fakeProject(i + 1),
        description: faker.lorem.sentences(),

        roles: [
          {
            start_date: dates.startDate,
            start_confidence: faker.datatype.float({ min: 0, max: 1, precision: 0.1 }),
            end_date: dates.endDate,
            end_confidence: faker.datatype.float({ min: 0, max: 1, precision: 0.1 }),

            skills: [{
              id: skill
            }],

            assignments: [{
              start_date: dates.startAssignmentDate,
              end_date: dates.endAssignmentDate,

              employee: {
                name: fakeEmployee(i),
                start_date: dates.startDate,
                end_date: null,

                skills: [
                  {
                    id: skill
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
  fakeEmployee,
  fakeProject,
  fakeRole,
  seed
}
