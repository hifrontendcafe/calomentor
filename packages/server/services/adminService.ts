import { Callback, Context } from "aws-lambda"

export const testService = async (event: any, context: Context, callback: Callback) => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      code: 200,
      message: "hola",
      data: {},
    }),
  };
}