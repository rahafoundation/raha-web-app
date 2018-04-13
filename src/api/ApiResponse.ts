import { ApiOperation } from "../reducers/operationsNew";

export type OperationsApiResponse = ApiOperation;

// as more response types appear, expand this type
type ApiResponse = OperationsApiResponse;
export default ApiResponse;
