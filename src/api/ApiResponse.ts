import { ApiOperation } from "../reducers/operationsNew";
import { ApiEndpoint } from "./";

export type OperationApiResponse = ApiOperation;
export type OperationsApiResponse = ApiOperation[];

// as more response types appear, expand this type
type ApiResponse = OperationApiResponse | OperationsApiResponse;
export default ApiResponse;
