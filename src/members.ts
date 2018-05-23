import * as firebase from "firebase";

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

// See https://stackoverflow.com/questions/990904/remove-accents-diacritics-in-a-string-in-javascript/
const removeAccents = (str: string) =>
  str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

// See https://stackoverflow.com/questions/4328500/how-can-i-strip-all-punctuation-from-a-string-in-javascript-using-regex/
const removePunctuation = (str: string) =>
  str.replace(/[,\/#!$%\^&\*;:{}=\_`~()]/g, "");

// TODO move server side
export const getUsername = (displayName: string, seedFn?: () => number) => {
  const userSlug = removePunctuation(removeAccents(displayName))
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ".");
  const userPin = getNumberSuffix(NUMBER_SUFFIX_LENGTH, seedFn || Math.random);
  return userSlug + "." + userPin;
};
