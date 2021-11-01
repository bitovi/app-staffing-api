const { Model } = require("objection");

module.exports = class Employee extends Model {
  static get tableName() {
    return "employee";
  }

  static get relationMappings() {
    const Skill = require("./skill");

    return {
      skills: {
        relation: Model.ManyToManyRelation,
        modelClass: Skill,
        join: {
          from: "employee.id",
          through: {
            from: "employee__skill.employee_id",
            to: "employee__skill.skill_id",
          },
          to: "skill.id",
        },
      },
    };
  }
};
