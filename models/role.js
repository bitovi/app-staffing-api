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
    return "roles";
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
          from: "roles.projectId",
          to: "project.id",
        },
      },

      skill: {
        relation: Model.BelongsToOneRelation,
        modelClass: Skill,
        join: {
          from: "roles.skillId",
          to: "skills.id",
        },
      },

      employeeRoles: {
        relation: Model.HasManyRelation,
        modelClass: EmployeeRole,
        join: {
          from: "skills.id",
          to: "employees.skills",
        },
      },

      employees: {
        relation: Model.ManyToManyRelation,
        modelClass: Employee,
        join: {
          from: "skills.id",
          through: {
            from: "employee_roles.roleId",
            to: "employee_roles.employeeId",
          },
          to: "employees.id",
        },
      },
    };
  }
}

module.exports = Role;
