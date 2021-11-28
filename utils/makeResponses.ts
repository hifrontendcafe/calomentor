import { RESPONSE_CODES } from "../constants";

export function makeSuccessResponse(
  data: any,
  responseCode: keyof typeof RESPONSE_CODES = "0"
) {
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: RESPONSE_CODES[responseCode],
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
) {
  const data = {};

  if (error) {
    data["error"] = error;
  }

  return {
    statusCode,
    body: JSON.stringify({
      message: RESPONSE_CODES[responseCode],
      data,
    }),
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  };
}
