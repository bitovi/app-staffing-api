const Role = require('../../src/models/role')

exports.seed = async function (knex) {
  // Deletes ALL existing entries
  await knex('skill').del()
  return knex('role').del()
    .then(async () => {
      // Inserts seed entries
      await Role.query().insertGraph({
        project_id: 1,
        skills: [
          {
            name: 'React'
          }
        ]
      })
    })
}
