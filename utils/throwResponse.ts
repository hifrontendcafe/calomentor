import { Callback } from "aws-lambda";
import { GlobalResponse } from "../types/globalTypes";

export const throwResponse = (
  callback: Callback<any>,
  message: string,
  statusCode: number,
  data: any = null
) => {
  const body: { message?: string; data?: any } = {};
  if (message) {
    body.message = message;
  }
  if (data) {
    body.data = data;
  }
  let response: GlobalResponse;
  response = {
    statusCode,
    body: JSON.stringify(body),
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  };
  callback(null, response);
};

export const throwLambdaResponse = (callback, response) => {
  callback(null, response);
};
