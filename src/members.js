const NUMBER_SUFFIX_LENGTH = 4;

const getNumberSuffix = (len, seedFn) => {
    const exclusiveMax = Math.pow(10, len);
    return (Math.floor(seedFn() * exclusiveMax) + exclusiveMax).toString().substring(1);
}

export const getMemberId = (displayName, seedFn) => {
    seedFn = seedFn || Math.random
    return displayName.trim().toLowerCase().replace(/\s+/g, '.') + '$' + getNumberSuffix(NUMBER_SUFFIX_LENGTH, seedFn);
}

export const getSuffixFromMemberId = (memberId) => {
    return memberId.substr(-1 * NUMBER_SUFFIX_LENGTH, NUMBER_SUFFIX_LENGTH);
}

export const getPrefixFromMemberId = (memberId) => {
    return memberId.substr(0, memberId.length - NUMBER_SUFFIX_LENGTH - 1);
}