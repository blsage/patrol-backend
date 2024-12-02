"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.snakeToCamel = exports.camelToSnake = void 0;
const camelToSnake = (obj) => {
    if (Array.isArray(obj)) {
        return obj.map(v => (0, exports.camelToSnake)(v));
    }
    else if (obj !== null && obj.constructor === Object) {
        const newObj = {};
        Object.keys(obj).forEach(key => {
            const newKey = key.replace(/([A-Z])/g, "_$1").toLowerCase();
            newObj[newKey] = (0, exports.camelToSnake)(obj[key]);
        });
        return newObj;
    }
    return obj;
};
exports.camelToSnake = camelToSnake;
const snakeToCamel = (obj) => {
    if (Array.isArray(obj)) {
        return obj.map(v => (0, exports.snakeToCamel)(v));
    }
    else if (obj !== null && obj.constructor === Object) {
        const newObj = {};
        Object.keys(obj).forEach(key => {
            const newKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
            newObj[newKey] = (0, exports.snakeToCamel)(obj[key]);
        });
        return newObj;
    }
    return obj;
};
exports.snakeToCamel = snakeToCamel;
