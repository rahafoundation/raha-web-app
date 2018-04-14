import ApplicationError from "./ApplicationError";
import { ApiOperation } from "../reducers/operationsNew";

export default class OperationInvalidError extends ApplicationError {
  public readonly operation: ApiOperation;

  constructor(message: string, operation: ApiOperation) {
    super(`${message} | Operation: ${JSON.stringify(operation)}`);

    this.operation = operation;
  }
}
