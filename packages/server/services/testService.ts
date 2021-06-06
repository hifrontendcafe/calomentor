import { Callback, Context } from "aws-lambda";
import { GlobalResponse } from "../types/globalTypes";

export const testService = async (
  event: any,
  context: Context,
  callback: Callback
): Promise<GlobalResponse> => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      code: 200,
      message: "hola",
      data: {},
    }),
  };
};
