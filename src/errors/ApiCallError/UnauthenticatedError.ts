import ApiCallError from "./";

/**
 * Represents a related to making an API call.
 */
export default class UnauthenticatedError extends ApiCallError {
  constructor() {
    super("User must first be authenticated.");
  }
}
