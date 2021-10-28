const { Model } = require('objection')

// interface Skill {
//   id: SkillId;
//   name: string;
// }

class Skill extends Model {
  static get tableName () {
    return 'skill'
  }

  // Define Relationships with other Models
  static get relationMappings () {
    // Importing models here avoids require loops.
    const Role = require('./role')
    const Employee = require('./employee')

    return {
      roles: {
        relation: Model.HasManyRelation,
        modelClass: Role,
        join: {
          from: 'skill.id',
          to: 'role.skillId'
        }
      },

      employees: {
        relation: Model.HasManyRelation,
        modelClass: Employee,
        join: {
          from: 'skill.id',
          to: 'employee.skills'
        }
      }
    }
  }
}

module.exports = Skill
