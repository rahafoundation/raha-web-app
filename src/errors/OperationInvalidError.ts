import ApplicationError from "./ApplicationError";
import { Operation } from "../reducers/operationsNew";

export default class OperationInvalidError extends ApplicationError {
  public readonly operation: Operation;

  constructor(message: string, operation: Operation) {
    super(`${message} | Operation: ${JSON.stringify(operation)}`);

    this.operation = operation;
  }
}
