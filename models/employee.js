const { Model } = require("objection");

// interface Employee {
//   id: EmployeeId;
//   name: string;
//   startDate: string;
//   endDate: string;
// }

class Employee extends Model {
  static get tableName() {
    return "employees";
  }

  // Define Relationships with other Models
  static get relationMappings() {
    // Importing models here avoids require loops.
    const Skill = require("./skill");
    const EmployeeRole = require("./employee-role");

    return {
      employeeRoles: {
        relation: Model.HasManyRelation,
        modelClass: EmployeeRole,
        join: {
          from: "employee.roleId",
          to: "employee_roles.employeeId",
        },
      },

      skills: {
        relations: Model.HasManyRelation,
        modelClass: Skill,
        join: {
          from: "employee.id",
          through: {
            from: "employee__skills.employeeId",
            to: "employee__skills.skillId",
          },
          to: "skill.id",
        },
      },
    };
  }
}

module.exports = Employee;
