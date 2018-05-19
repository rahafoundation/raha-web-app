const NUMBER_SUFFIX_LENGTH = 4;

export type MemberDoc = firebase.firestore.DocumentData;
export interface MemberEntry {
  readonly isFetching: boolean;
  // TODO: should this actually be optional?
  readonly memberDoc?: MemberDoc;
  readonly receivedAt: Date;
}

const getNumberSuffix = (len: number, seedFn: () => number) => {
  const exclusiveMax = Math.pow(10, len);
  return (Math.floor(seedFn() * exclusiveMax) + exclusiveMax)
    .toString()
    .substring(1);
};

export const getMemberId = (displayName: string, seedFn?: () => number) => {
  return (
    displayName
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ".") +
    "$" +
    getNumberSuffix(NUMBER_SUFFIX_LENGTH, seedFn || Math.random)
  );
};
