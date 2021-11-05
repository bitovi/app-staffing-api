"use strict";
const { Model } = require('objection');
module.exports = class Assignment extends Model {
    static get tableName() {
        return 'assignment';
    }
    static get jsonSchema() {
        return {
            type: 'object',
            required: ['employee_id', 'role_id', 'start_date'],
            properties: {
                id: {
                    type: 'string'
                },
                employee_id: {
                    type: 'string'
                },
                role_id: {
                    type: 'string'
                },
                start_date: { type: 'string' },
                end_date: { type: 'string' }
            },
            additionalProperties: false
        };
    }
    static get relationMappings() {
        const Role = require('./role');
        const Employee = require('./employee');
        return {
            roles: {
                relation: Model.BelongsToOneRelation,
                modelClass: Role,
                join: {
                    from: 'assignment.role_id',
                    to: 'role.id'
                }
            },
            employees: {
                relation: Model.BelongsToOneRelation,
                modelClass: Employee,
                join: {
                    from: 'assignment.employee_id',
                    to: 'employee.id'
                }
            }
        };
    }
};
//# sourceMappingURL=assignment.js.map