const { Model } = require('objection')

class Project extends Model {
  static get tableName () {
    return 'project'
  }

  // Define Relationships with other Models
  static get relationMappings () {
    // Importing models here avoids require loops.
    const Role = require('./role')
    const Assignment = require('./assignment')

    return {
      roles: {
        relation: Model.HasManyRelation,
        modelClass: Role,
        join: {
          from: 'project.id',
          to: 'role.project_id'
        }
      },
      assignments: {
        relation: Model.ManyToManyRelation,
        modelClass: Assignment,
        join: {
          from: 'project.id',
          through: {
            from: 'role.project_id',
            to: 'role.id'
          },
          to: 'assignment.role_id'

        }
      }
    }
  }
}

module.exports = Project
