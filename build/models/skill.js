"use strict";
const { Model } = require('objection');
const Role = require('./role');
module.exports = class Skill extends Model {
    static get tableName() {
        return 'skill';
    }
    static get jsonSchema() {
        return {
            type: 'object',
            required: ['name'],
            properties: {
                id: {
                    type: 'string'
                },
                name: {
                    type: 'string'
                }
            },
            additionalProperties: false
        };
    }
    // ??? Maybe
    static get jsonSchemaPatch() {
        const patchSchema = { ...this.jsonSchema };
        patchSchema.required = [];
        return patchSchema;
    }
    static get relationMappings() {
        return {
            roles: {
                relation: Model.ManyToManyRelation,
                modelClass: Role,
                join: {
                    from: 'role.id',
                    through: {
                        from: 'role__skill.skill_id',
                        to: 'role__skill.role_id'
                    },
                    to: 'skill.id'
                }
            }
        };
    }
};
//# sourceMappingURL=skill.js.map