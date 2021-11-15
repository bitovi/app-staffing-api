const { Model } = require('objection')

class Project extends Model {
  static get tableName () {
    return 'project'
  }

  static get jsonSchema () {
    return {
      $id: 'project',
      type: 'object',
      required: ['name', 'start_date'],
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        start_date: { type: 'date' },
        end_date: { type: 'date' }
      }
    }
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
