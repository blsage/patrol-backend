export const camelToSnake = (obj: any): any => {
    if (Array.isArray(obj)) {
        return obj.map(v => camelToSnake(v));
    } else if (obj !== null && obj.constructor === Object) {
        const newObj: any = {};
        Object.keys(obj).forEach(key => {
            const newKey = key.replace(/([A-Z])/g, "_$1").toLowerCase();
            newObj[newKey] = camelToSnake(obj[key]);
        });
        return newObj;
    }
    return obj;
};

export const snakeToCamel = (obj: any): any => {
    if (Array.isArray(obj)) {
        return obj.map(v => snakeToCamel(v));
    } else if (obj !== null && obj.constructor === Object) {
        const newObj: any = {};
        Object.keys(obj).forEach(key => {
            const newKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
            newObj[newKey] = snakeToCamel(obj[key]);
        });
        return newObj;
    }
    return obj;
};