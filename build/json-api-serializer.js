"use strict";
const JSONAPISerializer = require('json-api-serializer');
const Serializer = new JSONAPISerializer();
exports.Serializer = Serializer;
const deserialize = (data) => {
    if (data) {
        const { id } = data;
        return { id };
    }
    return data;
};
Serializer.register('employees', {
    id: 'id',
    relationships: {
        roles: { type: 'roles', deserialize },
        skills: { type: 'skills', deserialize }
    }
});
Serializer.register('roles', {
    id: 'id',
    relationships: {
        assignments: { type: 'assignments', deserialize },
        projects: { type: 'projects', deserialize },
        skills: { type: 'skills', deserialize },
        employees: { type: 'employees', deserialize }
    }
});
Serializer.register('skills', {
    id: 'id',
    relationships: {
        employees: { type: 'employees', deserialize },
        roles: { type: 'roles', deserialize }
    }
});
Serializer.register('projects', {
    id: 'id',
    relationships: {
        roles: { type: 'roles', deserialize }
    }
});
Serializer.register('assignments', {
    id: 'id',
    relationships: {
        employees: { type: 'employees', deserialize },
        roles: { type: 'roles', deserialize }
    }
});
//# sourceMappingURL=json-api-serializer.js.map