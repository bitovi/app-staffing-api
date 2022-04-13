exports.up = async function (knex) {
  await knex('role')
    .where(
      knex.raw(
        'pg_typeof(start_confidence)::text = ? OR pg_typeof(end_confidence)::text = ?',
        ['real', 'real']
      )
    )
    .update({
      start_confidence: knex.raw('start_confidence * 100'),
      end_confidence: knex.raw('end_confidence * 100')
    })

  await knex.schema.alterTable('role', function (table) {
    table.integer('start_confidence').notNullable().alter()
    table.integer('end_confidence').alter()
  })
}

exports.down = async function (knex) {
  await knex.schema.alterTable('role', function (table) {
    table.float('start_confidence').notNullable().alter()
    table.float('end_confidence').alter()
  })

  await knex('role').update({
    start_confidence: knex.raw('start_confidence / 100'),
    end_confidence: knex.raw('end_confidence / 100')
  })
}
