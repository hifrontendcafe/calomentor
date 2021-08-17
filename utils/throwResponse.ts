import { GlobalResponse } from "../types/globalTypes";

export const throwResponse = (callback, message, statusCode, data = null) => {
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
  };
  callback(null, response);
};
