const getNumberSuffix = (len, seedFn) => {
    const exclusiveMax = Math.pow(10, len);
    return (Math.floor(seedFn() * exclusiveMax) + exclusiveMax).toString().substring(1);
}

export const getMemberId = (displayName, seedFn) => {
    seedFn = seedFn || Math.random
    return displayName.trim().toLowerCase().replace(/\s+/g, '.') + '$' + getNumberSuffix(4, seedFn);
}
