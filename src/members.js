const NUMBER_SUFFIX_LENGTH = 4;

const getNumberSuffix = (len, seedFn) => {
    const exclusiveMax = Math.pow(10, len);
    return (Math.floor(seedFn() * exclusiveMax) + exclusiveMax).toString().substring(1);
}

export const getMemberId = (displayName, seedFn) => {
    return displayName.trim().toLowerCase().replace(/\s+/g, '.') + '$' + getNumberSuffix(NUMBER_SUFFIX_LENGTH, seedFn || Math.random);
}