const { Model } = require('objection')

// interface Role {
//   id: RoleId;
//   projectId: ProjectId
//   skillId: SkillId;
//   startDate: string;
//   startConfidence: string;
//   endDate: string;
//   endConfidence: string;
// }

class Role extends Model {
  static get tableName () {
    return 'role'
  }

  // Define Relationships with other Models
  static get relationMappings () {
    // Importing models here avoids require loops.
    const Skill = require('./skill')
    const Employee = require('./employee')
    const EmployeeRole = require('./employee-role')
    const Project = require('./project')

    return {
      project: {
        relation: Model.BelongsToOneRelation,
        modelClass: Project,
        join: {
          from: 'role.project_id',
          to: 'project.id'
        }
      },

      skill: {
        relation: Model.BelongsToOneRelation,
        modelClass: Skill,
        join: {
          from: 'role.skill_id',
          to: 'skill.id'
        }
      },

      employeeRoles: {
        relation: Model.HasManyRelation,
        modelClass: EmployeeRole,
        join: {
          from: 'role.id',
          to: 'employee__role.role_id'
        }
      },

      employees: {
        relation: Model.ManyToManyRelation,
        modelClass: Employee,
        join: {
          from: 'role.id',
          through: {
            from: 'employee__role.role_id',
            to: 'employee__role.employee_id'
          },
          to: 'employee.id'
        }
      }
    }
  }
}

module.exports = Role
