import ApplicationError from "../ApplicationError";

/**
 * Represents a related to making an API call.
 */
export default abstract class ApiCallError extends ApplicationError {
  constructor(message: string) {
    super(message);
  }
}
