import ApiCallError from "./";
import { ApiCall, resolveApiEndpoint } from "../../api";

function apiCallToString(apiCall: ApiCall) {
  const { url, method } = resolveApiEndpoint(apiCall);
  return `${method} ${url}`;
}

export default class InvalidApiRequestError extends ApiCallError {
  public readonly endpoint: ApiCall;

  constructor(failedApiCall: ApiCall) {
    super(
      `${apiCallToString(failedApiCall)} ${
        "params" in failedApiCall
          ? `with params ${JSON.stringify(failedApiCall.params)}`
          : ""
      } failed.`
    );

    this.endpoint = failedApiCall;
  }
}
