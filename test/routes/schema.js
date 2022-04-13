const EmployeeModel = require('../../src/models/employee')
const SkillModel = require('../../src/models/skill')
const ProjectModel = require('../../src/models/project')
const RoleModel = require('../../src/models/role')
const AssignmentModel = require('../../src/models/assignment')

module.exports = {
  routes: [
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
          type: 'string',
          faker: 'name.findName'
        },
        start_date: {
          type: 'string',
          format: 'date'
        },
        end_date: {
          type: 'string',
          format: 'date'
        },
        skills: {
          type: 'array',
          items: {
            type: 'object',
            required: [
              'id'
            ],
            properties: {
              id: {
                type: 'string',
                format: 'uuid'
              },
              name: {
                type: 'string'
              }
            },
            additionalProperties: false
          },
          uniqueItems: true
        }
      },
      primaryKeys: ['id'],
      required: ['name'],
      relations: ['skills', 'assignments']
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
        description: {
          type: 'string'
        }
      },
      primaryKeys: ['id'],
      required: ['name'],
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
          maximum: 100
        },
        end_date: {
          type: 'string'
        },
        end_confidence: {
          type: 'integer',
          minimum: 0,
          maximum: 100
        },
        project: {
          type: 'object',
          required: ['id'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid'
            }
          }
        }
      },
      primaryKeys: ['id'],
      required: ['start_date', 'start_confidence', 'project'],
      foreignKeys: {
        projects: {
          from: 'id',
          into: 'project_id'
        }
      },
      relations: ['skills', 'assignments', 'project', 'employees']
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
        start_date: {
          type: 'string'
        },
        end_date: {
          type: 'string'
        },
        employee: {
          type: 'object',
          required: ['id'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid'
            }
          }
        },
        role: {
          type: 'object',
          required: ['id'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid'
            }
          }
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
      relations: ['role', 'projects', 'employee']
    }
  ]

}
