const { Model } = require("objection");
const Employee = require("../../models/employee");
const Project = require("../../models/project");
const Skill = require("../../models/skill");
const faker = require('faker');

const fakesCache = new Map();
function generateAndCacheFake(keyPrefix, key, generator){
  const prefixedKey = `${keyPrefix}.${key}`;
  let value;
  
  // retrieve value from cache by key (if provided)
  if (key) {
    value = fakesCache.get(prefixedKey);
  }
  
  // generate fake value via provided generator (if needed)
  if (!value) {
    value = generator();
  }

  // cache value by key (if provided)
  if (key) {
    fakesCache.set(prefixedKey, value);
  }

  return value;
}

function fakeSkill(key) {
  return generateAndCacheFake('skill', key, () => `${faker.random.word().toLowerCase()}.js`);
}

function fakeEmployee(key) {
  return generateAndCacheFake('employee', key, () => faker.fake('{{name.firstName}} {{name.lastName}}'));
}

function fakeProject(key) {
  return generateAndCacheFake('project', key, () => faker.company.companyName());
}

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
  await Project.query().insertGraph([
    {
      name: fakeProject(),
      start_date: new Date(),
      end_date: new Date(),

      roles: [
        {
          start_date: new Date(),
          start_confidence: 1,
          end_date: new Date(),
          end_confidence: 1,

          skill: {
            '#id': fakeSkill(1),
            name: fakeSkill(1)
          },

          employeeRoles: {
            assignment_start_date: new Date(),
            assignment_end_date: new Date(),
            
            employee: {
              name: fakeEmployee(1),
              start_date: new Date(),
              end_date: new Date(),

              skills: [
                {
                  '#ref': fakeSkill(1)
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