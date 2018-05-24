// TODO: consider splitting the actual API endpoint types into their finer grained files
import { Uid } from "../identifiers";
import InvalidApiRequestError from "../errors/ApiCallError/InvalidApiRequestError";
import ApiCallFailedError from "../errors/ApiCallError/ApiCallFailedError";
import ApiResponse, {
  OperationsApiResponse,
  OperationApiResponse,
  MessageApiResponse
} from "./ApiResponse";
import UnauthenticatedError from "../errors/ApiCallError/UnauthenticatedError";
import NetworkError from "../errors/ApiCallError/NetworkError";

// tslint:disable-next-line:no-var-requires
const CONFIG = require("../data/config.json");
const API_BASE = CONFIG.apiBase;

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
  GET_OPERATIONS = "GET_OPERATIONS",
  REQUEST_INVITE = "REQUEST_INVITE",
  SEND_INVITE = "SEND_INVITE",
  MINT = "MINT",
  GIVE = "GIVE"
}

/**
 * Definition for the arguments you need to call a particular API endpoint
 */
interface ApiCallDefinition<E extends ApiEndpoint, Params, Body> {
  endpoint: E;
  params: Params;
  body: Body;
}
type TrustMemberApiCall = ApiCallDefinition<
  ApiEndpoint.TRUST_MEMBER,
  { uid: Uid },
  void
>;
type GetOperationsApiCall = ApiCallDefinition<
  ApiEndpoint.GET_OPERATIONS,
  void,
  void
>;
type RequestInviteApiCall = ApiCallDefinition<
  ApiEndpoint.REQUEST_INVITE,
  { uid: Uid },
  { fullName: string; videoUrl: string; username: string }
>;
type SendInviteApiCall = ApiCallDefinition<
  ApiEndpoint.SEND_INVITE,
  void,
  { inviteEmail: string }
>;
type MintApiCall = ApiCallDefinition<
  ApiEndpoint.MINT,
  void,
  { amount: string }
>;
type GiveApiCall = ApiCallDefinition<
  ApiEndpoint.GIVE,
  { uid: Uid },
  { amount: string; memo?: string }
>;
/**
 * All API calls you can make, and the arguments you need to call them.
 */
export type ApiCall =
  | TrustMemberApiCall
  | GetOperationsApiCall
  | RequestInviteApiCall
  | SendInviteApiCall
  | MintApiCall
  | GiveApiCall;

/**
 * Definition of how to use an API endpoint, i.e. what you have to provide to
 * call it, and what it will return to you.
 */
interface ApiEndpointDefinition<
  Call extends ApiCall,
  Resp extends ApiResponse
> {
  call: Call;
  response: Resp;
}

export type TrustMemberApiEndpoint = ApiEndpointDefinition<
  TrustMemberApiCall,
  OperationApiResponse
>;
export type GetOperationsApiEndpoint = ApiEndpointDefinition<
  GetOperationsApiCall,
  OperationsApiResponse
>;
export type RequestInviteApiEndpoint = ApiEndpointDefinition<
  RequestInviteApiCall,
  OperationApiResponse
>;
export type SendInviteApiEndpoint = ApiEndpointDefinition<
  SendInviteApiCall,
  MessageApiResponse
>;
export type MintApiEndpoint = ApiEndpointDefinition<
  MintApiCall,
  OperationApiResponse
>;
export type GiveApiEndpoint = ApiEndpointDefinition<
  GiveApiCall,
  OperationApiResponse
>;

type ApiDefinition =
  | TrustMemberApiEndpoint
  | GetOperationsApiEndpoint
  | RequestInviteApiEndpoint
  | SendInviteApiEndpoint
  | MintApiEndpoint
  | GiveApiEndpoint;

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
interface ApiEndpointLocation {
  uri: string;
  method: HttpVerb;
}

/**
 * Mapping from API endpoints to their corresponding unresolved locations
 */
const apiEndpointLocations: { [key in ApiEndpoint]: ApiEndpointLocation } = {
  [ApiEndpoint.TRUST_MEMBER]: {
    uri: "members/:uid/trust",
    method: HttpVerb.POST
  },
  [ApiEndpoint.GET_OPERATIONS]: {
    uri: "operations",
    method: HttpVerb.GET
  },
  [ApiEndpoint.REQUEST_INVITE]: {
    uri: "members/:uid/request_invite",
    method: HttpVerb.POST
  },
  [ApiEndpoint.SEND_INVITE]: {
    uri: "me/send_invite",
    method: HttpVerb.POST
  },
  [ApiEndpoint.MINT]: {
    uri: "me/mint",
    method: HttpVerb.POST
  },
  [ApiEndpoint.GIVE]: {
    uri: "members/:uid/give",
    method: HttpVerb.POST
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
 *
 * Searches the URI for wildcards (denoted by path values that start with a
 * colon, like /members/:memberId) and replaces them with matching named params.
 * Also prepends the API's base URL.
 */
export function resolveApiEndpoint<Def extends ApiDefinition>(
  apiCall: Def["call"]
): ResolvedApiEndpointSpec {
  const { uri, method } = apiEndpointLocations[apiCall.endpoint];

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
 *
 * @throws ApiCallError if the API request fails
 * @throws Error if fetch fails for network reasons
 * @throws Error if JSON can't be parsed
 */
export async function callApi<Def extends ApiDefinition>(
  apiCall: Def["call"],
  authToken?: string
): Promise<Def["response"]> {
  const { url, method } = resolveApiEndpoint(apiCall);
  const requestOptions: RequestInit = {
    method,
    cache: "no-cache",
    headers: {
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      "content-type": "application/json"
    },
    ...(apiCall.body ? { body: JSON.stringify(apiCall.body) } : {})
  };

  let res: Response;
  try {
    res = await fetch(url, requestOptions);
  } catch (err) {
    throw new NetworkError(err);
  }

  if (res.status === 403) {
    throw new UnauthenticatedError();
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
