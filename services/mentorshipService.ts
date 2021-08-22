import { Callback, Context } from "aws-lambda";
import { sendEmail } from "../utils/sendEmail";

export const mentorshipService = async (
  event: any,
  context: Context,
  callback: Callback
) => {
  try {
    const { email, subject } = JSON.parse(event.body);

    const html = "<div><span>hola lalalla</span></div>";
    const send = await sendEmail(email, subject, html);

    callback(null, {
      statusCode: 200,
      body: JSON.stringify({
        code: 200,
        message: "success",
        data: send,
      }),
    });
  } catch (error) {
    console.log(error);
    callback(null, {
      statusCode: 400,
      body: JSON.stringify({
        code: 400,
        message: "error",
        data: error,
      }),
    });
  }
};
