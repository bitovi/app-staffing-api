
exports.up = async function (knex) {
  await knex.schema.alterTable('skill', function (table) {
    table.string('name').unique().alter()
  })
}

exports.down = async function (knex) {
  await knex.schema.alterTable('skill', function (table) {
    table.string('name').alter()
  })
}
