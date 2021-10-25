import { GlobalResponse } from "../types/globalTypes";

export const throwResponse = (callback, message, statusCode, data = null) => {
  const body: { message?: string; data?: any } = {};
  if (message) {
    body.message = message;
  }
  console.log(data);
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

export const throwMentorshipResponse = (callback, response) => {
  callback(null, response);
};
