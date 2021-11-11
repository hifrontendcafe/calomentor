import { RESPONSE_CODES } from "../constants";

export function makeSuccessResponse(data: any, responseCode: string = "0") {
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

export function makeErrorResponse(statusCode: number, responseCode: string, error?: any) {
  const data = {
    message: RESPONSE_CODES[responseCode],
  };

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
