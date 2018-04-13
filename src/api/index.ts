// TODO: consider splitting the actual API endpoint types into their finer grained files
import { Uid } from "../identifiers";
import InvalidApiRequestError from "../errors/ApiCallError/InvalidApiRequestError";
import ApiCallFailedError from "../errors/ApiCallError/ApiCallFailedError";
import ApiResponse from "./ApiResponse";

// TODO: make this configurable, probably by environment variable
// It will be useful for several things:
// a) working offline
// b) testing API-dependent code paths
// c) different prod/test/staging environments
const API_BASE = "https://raha-5395e.appspot.com/api/";

export const enum ApiEndpoint {
  TRUST_MEMBER = "TRUST_MEMBER",
  GET_OPERATIONS = "GET_OPERATIONS"
}

enum HttpVerb {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  DELETE = "DELETE",
  PATCH = "PATCH"
}

/**
 * Represents details to call an API endpoint over HTTP
 */
interface ApiEndpointSpec {
  uri: string;
  method: HttpVerb;
}

/**
 * Represents details to call an API endpoint over HTTP, with a full url to
 * query and parameters resolved.
 */
interface ResolvedApiEndpointSpec {
  url: string;
  method: HttpVerb;
}

const apiEndpointSpecs: { [key in ApiEndpoint]: ApiEndpointSpec } = {
  [ApiEndpoint.TRUST_MEMBER]: {
    uri: "members/:uid/trust",
    method: HttpVerb.POST
  },
  [ApiEndpoint.GET_OPERATIONS]: {
    uri: "operations",
    method: HttpVerb.GET
  }
};

export type ApiCall =
  | {
      endpoint: ApiEndpoint.TRUST_MEMBER;
      params: {
        uid: Uid;
      };
    }
  | {
      endpoint: ApiEndpoint.GET_OPERATIONS;
      method: "GET";
    };

/**
 * Determines the URL and HTTP method for an API call.
 */
export function resolveApiEndpoint(apiCall: ApiCall): ResolvedApiEndpointSpec {
  const { uri, method } = apiEndpointSpecs[apiCall.endpoint];

  if (!("params" in apiCall)) {
    return { url: `${API_BASE}${uri}`, method };
  }

  const wildcards = uri.split("/").filter(part => part.charAt(0) === ":");

  const resolvedUri = wildcards.reduce((memo, wildcard) => {
    const paramName = wildcard.slice(1);
    if (!(paramName in apiCall.params)) {
      throw new InvalidApiRequestError(apiCall);
    }
    const paramValue: string = (apiCall.params as any)[paramName];
    // TODO: [#security] is there any sanitization we need to do here?
    return memo.replace(wildcard, paramValue);
  }, uri);

  return { url: `${API_BASE}${resolvedUri}`, method };
}

/**
 * Encapsulates logic for handling API calls.
 */
export async function callApi<ResponseBody extends ApiResponse>(
  apiCall: ApiCall,
  authToken?: string
): Promise<ResponseBody> {
  const { url, method } = resolveApiEndpoint(apiCall);
  const requestOptions = {
    method,
    headers: {
      Authorization: `Bearer ${authToken}`
    }
    // TODO: whenever we add an endpoint that requires a body, uncomment below
    // ...("body" in endpoint ? {body: endpoint.body} : {})
  };

  let res: Response;
  // TODO: figure out how we want to handle fetch throwing, i.e. the request for
  // network reasons failing;
  try {
    res = await fetch(url, requestOptions);
  } catch (err) {
    // TODO: real logging
    // TODO: handle network errors more elegantly than just crashing
    // tslint:disable-next-line:no-console
    console.error(err);
    throw err;
  }

  if (res.status > 399) {
    throw new ApiCallFailedError(url, requestOptions, res);
  }
  try {
    const responseData = await res.json();
    return responseData;
  } catch (err) {
    // TODO: real logging, and probably alerting on this too.
    // tslint:disable-next-line:no-console
    console.error(
      "Response was not valid JSON! This is unexpected and something is probably wrong on our end.",
      err
    );
    throw err;
  }
}
