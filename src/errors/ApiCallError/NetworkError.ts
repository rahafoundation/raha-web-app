import ApiCallError from "./";

/**
 * If the network request failed (i.e. fetch threw), this error wraps it
 */
export default class NetworkError extends ApiCallError {
  public readonly error: Error;
  constructor(error: Error) {
    super("Network request failed");
    this.error = error;
  }
}
