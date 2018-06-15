import { ApiCallError } from "./";

/**
 * If the network request failed (i.e. fetch threw), this error wraps it
 */
export class NetworkError extends ApiCallError {
  public readonly error: Error;
  constructor(error: Error) {
    super("Network request failed");
    this.error = error;

    // this is necessary, typescript or not, for proper subclassing of builtins:
    // https://github.com/Microsoft/TypeScript-wiki/blob/master/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
    // It is also necessary for any subclasses of this class, unfortunately.
    // TODO: once react-scripts 2.0 is out, we can use Babel Macros to do this automatically.
    // https://github.com/facebook/create-react-app/projects/3
    // https://github.com/loganfsmyth/babel-plugin-transform-builtin-extend
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}
