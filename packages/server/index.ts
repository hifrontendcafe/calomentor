import { Handler, Context, Callback } from "aws-lambda";
import { testService } from "./services/testService";
import { activateMentorService } from "./services/mentorService";


export const test: Handler = async (
  event: any,
  context: Context,
  callback: any
) => await testService(event, context, callback);

export const activateMentor: Handler = (
  event: any,
  context: Context,
  callback: Callback<any>
) => activateMentorService(event, context, callback);

export const mentorshipConfirmation: Handler = (
  event: any,
  context: Context,
  callback: Callback<any>
) => {
  callback(null, {
    statusCode: 200,
    body: JSON.stringify({
      code: 200,
      message: "error",
      data: "hola",
    }),
  });
};
