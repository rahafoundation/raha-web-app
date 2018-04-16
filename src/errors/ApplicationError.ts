/**
 * Represents an error that we know how to handle in this application.
 */
export default abstract class ApplicationError extends Error {
  constructor(message: string) {
    super(message);

    // TODO: Set up real logging
    // tslint:disable-next-line:no-console
    console.error(this);

    // this is necessary, typescript or not, for proper subclassing of builtins:
    // https://github.com/Microsoft/TypeScript-wiki/blob/master/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
    // TODO: once react-scripts 2.0 is out, we can use Babel Macros to do this automatically.
    // https://github.com/facebook/create-react-app/projects/3
    // https://github.com/loganfsmyth/babel-plugin-transform-builtin-extend
    Object.setPrototypeOf(this, ApplicationError.prototype);
  }
}
