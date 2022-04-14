exports.up = async (knex) => {
  await knex('skill').insert({ name: 'Project Management' })
  await knex('skill').delete().where({ name: 'Frontend' })
  await knex('skill').delete().where({ name: 'UX Design' })
}

exports.down = async (knex) => {
  await knex('skill').delete.where({ name: 'Project Management' })
  await knex('skill').insert()({ name: 'Frontend' })
  await knex('skill').insert()({ name: 'UX Design' })
}
