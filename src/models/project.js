const { Model } = require('objection')

class Project extends Model {
  static get tableName () {
    return 'project'
  }

  // Define Relationships with other Models
  static get relationMappings () {
    // Importing models here avoids require loops.
    const Role = require('./role')

    return {
      roles: {
        relation: Model.HasManyRelation,
        modelClass: Role,
        join: {
          from: 'project.id',
          to: 'role.project_id'
        }
      }
    }
  }
}

module.exports = Project
