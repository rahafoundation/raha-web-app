/**
 * Copied from ../../members.js and renamed with a .ts suffix.
 * There's probably a better way to do this, maybe copying files
 * during the build step?
 *
 * The .ts rename is annoying too, but node doesn't support ES-6
 * features like import, wheras the compilation of ts into js
 * handles that. See: https://github.com/firebase/functions-samples/tree/master/typescript-getting-started.
 */

const NUMBER_SUFFIX_LENGTH = 4;

const getNumberSuffix = (len, seedFn) => {
    const exclusiveMax = Math.pow(10, len);
    return (Math.floor(seedFn() * exclusiveMax) + exclusiveMax).toString().substring(1);
}

export const getMemberId = (displayName, seedFn) => {
    return displayName.trim().toLowerCase().replace(/\s+/g, '.') + '$' + getNumberSuffix(NUMBER_SUFFIX_LENGTH, seedFn || Math.random);
}

export const getSuffixFromMemberId = (memberId) => {
    return memberId.substr(-1 * NUMBER_SUFFIX_LENGTH, NUMBER_SUFFIX_LENGTH);
}

export const getPrefixFromMemberId = (memberId) => {
    return memberId.substr(0, memberId.length - NUMBER_SUFFIX_LENGTH - 1);
}