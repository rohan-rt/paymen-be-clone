// Use to pass string type values in to know whether it contains an integer or not
export function isInt(val: any) {
    if (Number.isInteger(parseInt(val))) return val;
    else return null;
}

export function containsValue(val: any) {
    if (typeof val === 'object') {
        for (const v in val) {
            if (val && Boolean(val)) return true;
        }
    } else return fullTrim(val) && Boolean(val);
}

export function fullTrim(val: string) {
    return val.replace(/\s+/g, ' ').trim();
}

export function trimObject(obj: any, full: boolean) {
    const trimmed = JSON.stringify(obj, (key, value) => {
        if (typeof value === 'string') {
            if (full) return fullTrim(value);
            else return value.trim();
        } else return value;
    });
    return JSON.parse(trimmed);
}

export function removeCommon(obj) {
    if (obj?.createdAt) delete obj.createdAt;
    if (obj?.createdBy) delete obj.createdBy;
    if (obj?.updatedAt) delete obj.updatedAt;
    if (obj?.updatedBy) delete obj.updatedBy;
    return obj;
}

export function regexifyArrayInput(keywords: string[]) {
    let list = '';
    keywords.forEach((k) => {
        if (list) list = list + '|.*' + k + '.*';
        else list = '.*' + k + '.*';
    });
    return list;
}

export function isValidEmail(email: string) {
    if (!email) return false;
    const re =
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

export function arrayCompare(arr1: any[], arr2: any[]) {
    if (!arr2) return false;
    const typeOfArray = typeof arr1[0];
    const c1 = typeOfArray === 'string';
    const c2 = arr1.length === arr2.length;
    const c3 = arr1.every((u, i) => u === arr2[i]);
    if (c1 && c2 && c3) return true;
    const c4 = typeOfArray === 'object';
    const c5 = arr1.every((u, i) => arr2[i] && Object.keys(u).every((p) => u[p] === arr2[i][p]));
    if (c4 && c2 && c5) return true;
    else return false;
}

export function dateDiff(dt1: Date, dt2: Date, type?: string) {
    let base = 1; // In miliseconds
    switch (type) {
        case 'hours':
            base = base * 1000 * 60 * 60;
            break;
        case 'minutes':
            base = base * 1000 * 60;
            break;
        case 'seconds':
            base = base * 1000;
            break;
        default:
            break;
    }
    const diff = (dt2.getTime() - dt1.getTime()) / base;
    return Math.abs(Math.floor(diff));
}

export function generateOTP() {
    return Math.floor((1 + Math.random()) * 1000000)
        .toString()
        .slice(1, 7);
}
