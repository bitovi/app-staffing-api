const { Model } = require("objection");

// interface Skill {
//   id: SkillId;
//   name: string;
// }

class Skill extends Model {
  static get tableName() {
    return "skills";
  }

  // Define Relationships with other Models
  static get relationMappings() {
    // Importing models here avoids require loops.
    const Role = require("./Role");
    const Employee = require("./Employee");

    return {
      roles: {
        relation: Model.HasManyRelation,
        modelClass: Role,
        join: {
          from: "skills.id",
          to: "role.skillId",
        },
      },

      employees: {
        relation: Model.HasManyRelation,
        modelClass: Employee,
        join: {
          from: "skills.id",
          to: "employees.skills",
        },
      },
    };
  }
}

module.exports = Skill;
