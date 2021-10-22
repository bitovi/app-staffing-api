exports.up = async (knex) => {
  // make uuid_generate_v4() db function available
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');

  await knex.schema.createTable('skill', function (table) {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('name').notNullable();
  });

  await knex.schema.createTable('employee', function (table) {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('name').notNullable();
    table.date('start_date');
    table.date('end_date');
  });

  await knex.schema.createTable('project', function (table) {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('name').notNullable();
    table.date('start_date').notNullable();
    table.date('end_date');
  });

  await knex.schema.createTable('role', function (table) {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('skill_id').notNullable().references('skill.id');
    table.uuid('project_id').notNullable().references('project.id');
    table.date('start_date');
    table.integer('start_confidence');
    table.date('end_date');
    table.integer('end_confidence');
  });

  await knex.schema.createTable('employee__role', function (table) {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('employee_id').notNullable().references('employee.id');
    table.uuid('role_id').notNullable().references('role.id');
    table.date('assignment_start_date');
    table.date('assignment_end_date');
  });

  await knex.schema.createTable('employee__skill', function (table) {
    table.uuid('employee_id').notNullable().references('employee.id');
    table.uuid('skill_id').notNullable().references('skill.id');

    table.primary(['employee_id', 'skill_id']);
  });
};

exports.down = async (knex) => {
  await knex.schema.dropTable('employee__skill');
  await knex.schema.dropTable('employee__role');
  await knex.schema.dropTable('role');
  await knex.schema.dropTable('project');
  await knex.schema.dropTable('employee');
  await knex.schema.dropTable('skill');

  await knex.raw('DROP EXTENSION IF EXISTS "uuid-ossp";')
};
