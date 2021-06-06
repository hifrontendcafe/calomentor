import { Handler, Context, Callback } from "aws-lambda";
import { testService } from "./services/testService";

export const test: Handler = async (
  event: any,
  context: Context,
  callback: Callback
) =>
  await testService(event, context, callback);
