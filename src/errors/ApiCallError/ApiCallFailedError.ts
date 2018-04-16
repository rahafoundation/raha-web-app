import ApiCallError from "./";

function requestMethod(requestOptions?: RequestInit) {
  return requestOptions && requestOptions.method
    ? requestOptions.method
    : "GET";
}

/**
 * Represents a bad response after trying to make an API call.
 */
export default class ApiCallFailedError extends ApiCallError {
  public readonly response: Response;
  public readonly url: string;
  public readonly requestOptions: RequestInit;

  constructor(url: string, requestOptions: RequestInit, response: Response) {
    super(
      `${requestMethod(requestOptions)} to url '${url}' failed with status ${
        response.status
      }`
    );

    this.response = response;
    this.url = url;
    // TODO: [#security] revisit this code to ensure that this is enough to
    // sanitize API call logs if we ever monitor them externally, i.e. via
    // Sentry
    this.requestOptions = {
      ...requestOptions,
      headers: {
        ...requestOptions.headers,
        Authentication: "REDACTED"
      }
    };
  }
}
