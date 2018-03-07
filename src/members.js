const getNumberSuffix = (len: number) => {
    const exclusiveMax = Math.pow(10, len);
    return (Math.floor(Math.random() * exclusiveMax) + exclusiveMax).toString().substring(1);
}

export const getMemberId = (displayName: string) => {
    return displayName.trim().toLowerCase().replace(/\s+/g, '.') + '#' + getNumberSuffix(4);
}

