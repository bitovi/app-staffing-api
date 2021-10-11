const { Model } = require("objection");

// interface Project {
//   id: ProjectId;
//   name: string;
//   description: string;
// }

class Project extends Model {
  static get tableName() {
    return "project";
  }

  // Define Relationships with other Models
  static get relationMappings() {
    // Importing models here avoids require loops.
    const Role = require("./role");
    const Employee = require("./employee");

    return {
      roles: {
        relation: Model.HasManyRelation,
        modelClass: Role,
        join: {
          from: "project.id",
          to: "role.projectId",
        },
      },
    };
  }
}

module.exports = Project;
