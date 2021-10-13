const { Model } = require("objection");

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
  static get tableName() {
    return "role";
  }

  // Define Relationships with other Models
  static get relationMappings() {
    // Importing models here avoids require loops.
    const Role = require("./role");
    const Skill = require("./skill");
    const EmployeeRole = require("./employee-role");

    return {
      role: {
        relation: Model.BelongsToOneRelation,
        modelClass: Role,
        join: {
          from: "role.projectId",
          to: "project.id",
        },
      },

      skill: {
        relation: Model.BelongsToOneRelation,
        modelClass: Skill,
        join: {
          from: "role.skillId",
          to: "skill.id",
        },
      },

      employeeRoles: {
        relation: Model.HasManyRelation,
        modelClass: EmployeeRole,
        join: {
          from: "skill.id",
          to: "employee.skills",
        },
      },

      employees: {
        relation: Model.ManyToManyRelation,
        modelClass: Employee,
        join: {
          from: "skill.id",
          through: {
            from: "employee__role.roleId",
            to: "employee__role.employeeId",
          },
          to: "employees.id",
        },
      },
    };
  }
}

module.exports = Role;
