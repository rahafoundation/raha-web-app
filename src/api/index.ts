// TODO: consider splitting the actual API endpoint types into their finer grained files
import { Uid } from "../identifiers";
import InvalidApiRequestError from "../errors/ApiCallError/InvalidApiRequestError";
import ApiCallFailedError from "../errors/ApiCallError/ApiCallFailedError";
import ApiResponse, {
  OperationsApiResponse,
  OperationApiResponse
} from "./ApiResponse";

// TODO: make this configurable, probably by environment variable
// It will be useful for several things:
// a) working offline
// b) testing API-dependent code paths
// c) different prod/test/staging environments
const API_BASE = "https://raha-5395e.appspot.com/api/";

/* ==============================
 * Definitions of how to address
 * and use API endpoints
 * ==============================
 */

/**
 * Canonical name of an endpoint you can query.
 */
export const enum ApiEndpoint {
  TRUST_MEMBER = "TRUST_MEMBER",
  GET_OPERATIONS = "GET_OPERATIONS"
}

/**
 * Definition for the arguments you need to call a particular API endpoint
 */
interface ApiCallDef<E extends ApiEndpoint, Params, Body> {
  endpoint: E;
  params: Params;
  body: Body;
}
type TrustMemberApiCall = ApiCallDef<
  ApiEndpoint.TRUST_MEMBER,
  { uid: Uid },
  void
>;
type GetOperationsApiCall = ApiCallDef<ApiEndpoint.GET_OPERATIONS, void, void>;
/**
 * All API calls you can make, and the arguments you need to call them.
 */
export type ApiCall = TrustMemberApiCall | GetOperationsApiCall;

/**
 * Definition of how to use an API endpoint, i.e. what you have to provide to
 * call it, and what it will return to you.
 */
interface ApiEndpointDef<Call extends ApiCall, Resp extends ApiResponse> {
  call: Call;
  response: Resp;
}

export type TrustMemberApiEndpoint = ApiEndpointDef<
  TrustMemberApiCall,
  OperationApiResponse
>;

export type GetOperationsApiEndpoint = ApiEndpointDef<
  GetOperationsApiCall,
  OperationsApiResponse
>;
type ApiDefinition = TrustMemberApiEndpoint | GetOperationsApiEndpoint;

/* =================================
 * Resolving API endpoint locations
 * =================================
 */
enum HttpVerb {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  DELETE = "DELETE",
  PATCH = "PATCH"
}

/**
 * The location of an API endpoint. Uri may contain wildcards that must be
 * resolved, and only represents a path without a domain to send the request to.
 */
interface ApiEndpointSpec {
  uri: string;
  method: HttpVerb;
}

/**
 * Mapping from API endpoints to their corresponding unresolved locations
 */
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

/**
 * The location of an API endpoint, with a full url to query and parameters
 * resolved.
 */
interface ResolvedApiEndpointSpec {
  url: string;
  method: HttpVerb;
}

/**
 * Determines the URL and HTTP method for an API call.
 */
export function resolveApiEndpoint<Def extends ApiDefinition>(
  apiCall: Def["call"]
): ResolvedApiEndpointSpec {
  const { uri, method } = apiEndpointSpecs[apiCall.endpoint];

  const params = apiCall.params;
  if (!params) {
    return { url: `${API_BASE}${uri}`, method };
  }

  const wildcards = uri.split("/").filter(part => part.charAt(0) === ":");

  const resolvedUri = wildcards.reduce((memo, wildcard) => {
    const paramName = wildcard.slice(1);
    if (!(paramName in params)) {
      throw new InvalidApiRequestError(apiCall);
    }
    const paramValue: string = (apiCall.params as any)[paramName];
    // TODO: [#security] is there any sanitization we need to do here?
    return memo.replace(wildcard, paramValue);
  }, uri);

  return { url: `${API_BASE}${resolvedUri}`, method };
}

/**
 * Call an API endpoint.
 */
export async function callApi<Def extends ApiDefinition>(
  apiCall: Def["call"],
  authToken?: string
): Promise<Def["response"]> {
  const { url, method } = resolveApiEndpoint(apiCall);
  const body = apiCall.body;
  const requestOptions: RequestInit = {
    method,
    cache: "no-cache",
    headers: {
      Authorization: `Bearer ${authToken}`,
      "content-type": "application/json"
    },
    body: JSON.stringify(!!apiCall.body ? { body: apiCall.body } : {})
  };

  let res: Response;
  try {
    res = await fetch(url, requestOptions);
  } catch (err) {
    // TODO: figure out how we want to handle fetch throwing, i.e. the request
    // for network reasons failing; Something else is catching this and
    // preventing it from hard crashing, but I'm not sure what. Can test by
    // using Chrome network conditions to simulate being offline, then hit an
    // API endpoint.
    // TODO: real logging
    // tslint:disable-next-line:no-console
    console.error("Fetch failed", err);
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
