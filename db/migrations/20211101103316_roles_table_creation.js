exports.up = async (knex) => {
  await knex.raw(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
  await knex.schema.createTable("role", function (table) {
    table.uuid("id")
      .defaultTo(knex.raw('uuid_generate_v4()'))
      .primary();
    table.date("start_date");
    table.integer('start_confidence');
    table.date("end_date")
    table.integer('end_confidence');
    table.integer("project_id").notNullable();
  });
};

exports.down = async (knex) => {
  await knex.schema.dropTable("role");
};
