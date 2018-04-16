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
      ...(requestOptions.headers
        ? {
            headers: {
              ...requestOptions.headers,
              ...("Authentication" in requestOptions.headers
                ? { Authentication: "REDACTED" }
                : {})
            }
          }
        : {})
    };

    // this is necessary, typescript or not, for proper subclassing of builtins:
    // https://github.com/Microsoft/TypeScript-wiki/blob/master/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
    // It is also necessary for any subclasses of this class, unfortunately.
    // TODO: once react-scripts 2.0 is out, we can use Babel Macros to do this automatically.
    // https://github.com/facebook/create-react-app/projects/3
    // https://github.com/loganfsmyth/babel-plugin-transform-builtin-extend
    Object.setPrototypeOf(this, ApiCallFailedError.prototype);
  }
}
