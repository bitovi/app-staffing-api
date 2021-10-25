const { Model } = require("objection");
const Employee = require("../../models/employee");
const Project = require("../../models/project");
const Skill = require("../../models/skill");

exports.seed = async (knex) => {
  // Give the knex instance to Objection
  Model.knex(knex);

  // delete data in reverse dependency order to avoid fk issues
  await knex('employee__role').del();
  await knex('role').del();
  await knex('project').del();
  await knex('employee__skill').del();
  await knex('employee').del();
  await knex('skill').del();

  // insert seed data

  // TODO: remove examples
  // await knex('skill').insert([
  //   { name: 'Skill 1'},
  //   { name: 'Skill 2'},
  //   { name: 'Skill 3'}
  // ]);

  ////////////////////////////////
  // const skillA = await Skill.query().insert({ name: 'Skill A' });
  // const skillB = await Skill.query().insert({ name: 'Skill B' });
  // const skillC = await Skill.query().insert({ name: 'Skill C' });

  // console.log(skillA);
  // console.log(skillB);
  // console.log(skillC);

  ////////////////////////////////
  // await Employee.query().insertGraph([
  //   {
  //     name: "Michael Haynie",
  //     start_date: new Date(),
  //     end_date: new Date(),
  //     skills: [
  //       { name: "Nunchuck" },
  //       { name: "Bow Hunting" },
  //       { name: "Computer Hacking" }
  //     ]
  //   }
  // ]);

  ////////////////////////////////////
  await Project.query().insertGraph([
    {
      name: 'Project A',
      start_date: new Date(),
      end_date: new Date(),

      roles: [
        {
          start_date: new Date(),
          start_confidence: 1,
          end_date: new Date(),
          end_confidence: 1,

          skill: {
            '#id': 'skillA',
            name: 'Skill A'
          },

          employeeRoles: {
            assignment_start_date: new Date(),
            assignment_end_date: new Date(),
            
            employee: {
              name: 'Employee A',
              start_date: new Date(),
              end_date: new Date(),

              skills: [
                {
                  '#ref': 'skillA'
                }
              ]
            }
          }
        }
      ]
    }
  ], { allowRefs: true });

  // Log seeded projects demonstrating most nested relations
  console.log(JSON.stringify(await Project.query().withGraphFetched({
    roles: {
      skill: true,
      employeeRoles: {
        employee: {
          skills: true
        }
      },
      employees: true
    },
  })));

}