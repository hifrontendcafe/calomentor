import type { APIGatewayProxyResult, Callback } from "aws-lambda";

import type { OutgoingHttpHeaders } from "http";
import { RESPONSE_CODES } from "../constants";

interface Headers extends OutgoingHttpHeaders {}

export interface Response {
  statusCode: number;
  body: any;
  headers: Headers;
}

export function makeSuccessResponse(
  data: any,
  responseCode: keyof typeof RESPONSE_CODES = "1"
): APIGatewayProxyResult {
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: RESPONSE_CODES[responseCode],
      code: responseCode,
      data,
    }),
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  };
}

export function makeErrorResponse(
  statusCode: number,
  responseCode: keyof typeof RESPONSE_CODES,
  error?: any
): APIGatewayProxyResult {
  const data = {
    code: responseCode,
    message: RESPONSE_CODES[responseCode],
  };

  if (error) {
    data["error"] = error;
  }

  return {
    statusCode,
    body: JSON.stringify(data),
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  };
}

export const makeLambdaResponse = <T>(callback: Callback, response: T) => {
  callback(null, response);
};
