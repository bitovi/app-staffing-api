
exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('employee').del()
    .then(function () {
      // Inserts seed entries
      return knex('employee').insert([
        {name: 'Mark Repka', start_date: '2018-09-08'},
        {name: 'Cherif Bouchelaghem'},
        {name: 'John Doe', start_date: '2018-09-08', end_date: '2019-09-08'}
      ]);
    });
};
