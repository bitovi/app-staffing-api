const { Model } = require("objection");

// interface AssignedEmployee {
//   id: AssignedEmployeeId;
//   employeeId: EmployeeId;
//   roleId: RoleId;
//   assignmentStartDate?: string;
//   assignmentEndDate?: string;
// }

class Assignment extends Model {
  static get tableName() {
    return "employee-roles";
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
          from: "employee__roles.roleId",
          to: "roles.id",
        },
      },

      role: {
        relation: Model.BelongsToOneRelation,
        modelClass: Employee,
        join: {
          from: "employee__roles.employeeId",
          to: "employees.id",
        },
      },
    };
  }
}

module.exports = Assignment;
