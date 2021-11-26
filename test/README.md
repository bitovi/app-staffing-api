# Generate and run CRUD JSONAPI tests based on simple json schema files

This module iterates over the routes defined in `setup-generic.js` and runs tests based on the defined schema. This modules assumes that route names are in plural and table names are in singular forms.

To add a new route for example called `departments` at the `/departments` link you need to add the following to the `setup-generic.js` file. Assume that the Department model has a foreign-key that links the manager to an employee.id

1 - Make sure to require the Model of the new route, in our case let's call it `DepartmentModel` assuming the model filename is `department`
```
const DepartmentModel = require('../../src/models/department') 
```
2 - add the schema to the routes array
```
    // deparments schema
    {
      routeName: 'deparments',
      model: DepartmentModel,
      properties: {
        id: {
          type: 'string',
          format: 'uuid'
        },
        name: {
          type: 'string'
        },
        manager_id: {
          type: 'string'
        }
      },
      primaryKeys: ['id'],
      required: ['manager_id'],
      foreignKeys: {
        employees: {
          from: 'id',
          into: 'manager_id'
        }
      },
      relations: ['skills', 'assignments', 'projects', 'employees']
    }
```

So your file should look like this

```
const EmployeeModel = require('../../src/models/employee')
const SkillModel = require('../../src/models/skill')
const ProjectModel = require('../../src/models/project')
const RoleModel = require('../../src/models/role')
const AssignmentModel = require('../../src/models/assignment')
// Your new route model added here
const DepartmentModel = require('../../src/models/department')

module.exports = {
  routes: [
    // Your new route schema added here
    // deparments schema
    {
      routeName: 'deparments',
      model: DepartmentModel,
      properties: {
        id: {
          type: 'string',
          format: 'uuid'
        },
        name: {
          type: 'string'
        },
        manager_id: {
          type: 'string'
        }
      },
      primaryKeys: ['id'],
      required: ['manager_id'],
      foreignKeys: {
        employees: {
          from: 'id',
          into: 'manager_id'
        }
      },
      relations: ['skills', 'assignments', 'projects', 'employees']
    }
    // skills schema
    {
      routeName: 'skills',
      model: SkillModel,
      properties: {
        id: { type: 'string', format: 'uuid' },
        name: {
          type: 'string'
        }
      },
      primaryKeys: ['id'],
      required: ['name'],
      relations: ['roles', 'employees']
    },

    // employees schema
    {
      routeName: 'employees',
      model: EmployeeModel,
      properties: {
        id: { type: 'string', format: 'uuid' },
        name: {
          type: 'string'
        },
        start_date: {
          type: 'string'
        },
        end_date: {
          type: 'string'
        }
      },
      primaryKeys: ['id'],
      required: ['name'],
      relations: ['skills', 'roles', 'assignments']
    },

    // projects schema
    {
      routeName: 'projects',
      model: ProjectModel,
      properties: {
        id: { type: 'string', format: 'uuid' },
        name: {
          type: 'string'
        },
        start_date: {
          type: 'string'
        },
        end_date: {
          type: 'string'
        }
      },
      primaryKeys: ['id'],
      required: ['name', 'start_date'],
      relations: ['roles', 'assignments']
    },

    // roles schema
    {
      routeName: 'roles',
      model: RoleModel,
      properties: {
        id: {
          type: 'string',
          format: 'uuid'
        },
        start_date: {
          type: 'string'
        },
        start_confidence: {
          type: 'integer',
          minimum: 0,
          maximum: 10
        },
        end_date: {
          type: 'string'
        },
        end_confidence: {
          type: 'integer',
          minimum: 0,
          maximum: 10
        },
        project_id: {
          type: 'string',
          format: 'uuid'
        }
      },
      primaryKeys: ['id'],
      required: ['project_id'],
      foreignKeys: {
        projects: {
          from: 'id',
          into: 'project_id'
        }
      },
      relations: ['skills', 'assignments', 'projects', 'employees']
    },

    // assignments schema
    {
      routeName: 'assignments',
      model: AssignmentModel,
      properties: {
        id: {
          type: 'string',
          format: 'uuid'
        },
        employee_id: {
          type: 'string',
          format: 'uuid'
        },
        role_id: {
          type: 'string',
          format: 'uuid'
        },
        start_date: {
          type: 'string'
        },
        end_date: {
          type: 'string'
        }
      },
      primaryKeys: ['id'],
      required: ['employee_id', 'role_id', 'start_date'],
      foreignKeys: {
        employees: {
          from: 'id',
          into: 'employee_id'
        },
        roles: {
          from: 'id',
          into: 'role_id'
        }
      },
      relations: ['roles', 'projects', 'employees']
    }
  ]

}

```
Note that all relations should be already defined in the new model for the tests to pass. Creating the schema before creating the route would still create the tests but as expected the tests would fail.
