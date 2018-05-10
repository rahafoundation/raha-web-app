import { Operation } from "../reducers/operations";

export type OperationApiResponse = Operation;
export type OperationsApiResponse = Operation[];
export interface MessageApiResponse {
  message: string;
}

// as more response types appear, expand this type
type ApiResponse =
  | OperationApiResponse
  | OperationsApiResponse
  | MessageApiResponse;
export default ApiResponse;
