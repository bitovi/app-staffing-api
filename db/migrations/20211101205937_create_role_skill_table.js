
exports.up = async(knex) => {
    await knex.schema.createTable('role__skill', (table) => {
        table.uuid('role_id').notNullable();
        table.uuid('skill_id').notNullable();

        table.primary(['role_id', 'skill_id']);

        table.foreign('role_id').references('role.id');
        table.foreign('skill_id').references('skill.id');

    });
};

exports.down = async (knex) => {
    await knex.schema.dropForeign(['role_id', 'skill_id']);
    await knex.schema.dropTable('role__skill');
};
