
exports.seed = (knex) => {
  // Deletes ALL existing entries
  return knex('skill').del()
    .then(function () {
      // Inserts seed entries
      return knex('skill').insert([
        { name: 'nodejs' },
        { name: 'react' },
        { name: 'angular' },
        { name: 'vuejs' }
      ])
    })
}
