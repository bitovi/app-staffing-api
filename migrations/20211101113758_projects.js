exports.up = async (knex) => {
  await knex.schema.createTable("project", function (table) {
    table.increments("id");
    table.string("name").notNullable();
    table.date("start_date").notNullable();
    table.date("end_date");
  });
};

exports.down = async (knex) => {
  await knex.schema.dropTable("project");
};
