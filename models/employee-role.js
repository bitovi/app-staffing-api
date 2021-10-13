const { Model } = require("objection");

// interface AssignedEmployee {
//   id: AssignedEmployeeId;
//   employeeId: EmployeeId;
//   roleId: RoleId;
//   assignmentStartDate?: string;
//   assignmentEndDate?: string;
// }

class EmployeeRole extends Model {
  static get tableName() {
    return "employee__role";
  }

  // Define Relationships with other Models
  static get relationMappings() {
    // Importing models here avoids require loops.
    const Role = require("./role");
    const Employee = require("./employee");

    return {
      employee: {
        relation: Model.BelongsToOneRelation,
        modelClass: Role,
        join: {
          from: "employee__role.roleId",
          to: "role.id",
        },
      },

      role: {
        relation: Model.BelongsToOneRelation,
        modelClass: Employee,
        join: {
          from: "employee__role.employeeId",
          to: "employee.id",
        },
      },
    };
  }
}

module.exports = EmployeeRole;
