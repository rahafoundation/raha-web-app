import ApplicationError from './ApplicationError';
import { APIOperation } from '../reducers/operationsNew';

export default class OperationInvalidError extends ApplicationError {
  public readonly operation: APIOperation;

  constructor(message: string, operation: APIOperation) {
    super(`${message} | Operation: ${JSON.stringify(operation)}`)

    this.operation = operation;

    // this is necessary, typescript or not, for proper subclassing of builtins:
    // https://github.com/Microsoft/TypeScript-wiki/blob/master/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
    // TODO: once react-scripts 2.0 is out, we can use Babel Macros to do this automatically.
    // https://github.com/facebook/create-react-app/projects/3
    // https://github.com/loganfsmyth/babel-plugin-transform-builtin-extend
    Object.setPrototypeOf(this, OperationInvalidError.prototype);
  }
}
