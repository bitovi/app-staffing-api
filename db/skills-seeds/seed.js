const Skill = require('../../src/models/skill')
const { Model } = require('objection')

const seed = async (knex) => {
  Model.knex(knex)

  await Skill.query().insert({ name: 'Product Design' })
  await Skill.query().insert({ name: 'UX Design' })
  await Skill.query().insert({ name: 'React' })
  await Skill.query().insert({ name: 'Angular' })
  await Skill.query().insert({ name: 'Frontend' })
  await Skill.query().insert({ name: 'Backend' })
  await Skill.query().insert({ name: 'DevOps' })
}

module.exports = {
  seed
}
