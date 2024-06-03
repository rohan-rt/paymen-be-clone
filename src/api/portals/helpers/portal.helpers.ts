export function generateName(name) {
    const baseSixtySix = incrementBase36(name);
    const lowest = getMultipleThree(baseSixtySix.length);
    const result = baseSixtySix
        .padStart(lowest, '0')
        .match(/.{1,3}/g)
        .join('_');

    return result;
}

export function incrementBase36(code) {
    const baseTen = parseInt(code, 36);
    return (baseTen + 1).toString(36);
}

export function getMultipleThree(value) {
    while (value % 3 !== 0) {
        value += 1;
    }
    return value;
}


