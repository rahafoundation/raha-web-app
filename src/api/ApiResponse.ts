import { Operation } from "../reducers/operations";
import { ApiEndpoint } from "./";

export type OperationApiResponse = Operation;
export type OperationsApiResponse = Operation[];

// as more response types appear, expand this type
type ApiResponse = OperationApiResponse | OperationsApiResponse;
export default ApiResponse;
