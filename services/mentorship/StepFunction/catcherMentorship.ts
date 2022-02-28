import { Handler } from "aws-lambda";
import { RESPONSE_CODES } from "../../../constants";
import { MentorshipResponse } from "../../../types";
import { sendMessageToCalobot } from "../../../utils/bot";
import { makeLambdaResponse } from "../../../utils/makeResponses";

const catcherMentorship: Handler = async (event, _, callback) => {
  try {
    await sendMessageToCalobot({
      description: "Hubo un error con una mentoria. \n" + JSON.stringify(event),
      title: "Error",
      footer: "Error Calomentor",
      timestamp: Date.now(),
      mentions: [641995600946003998],
    });

    return makeLambdaResponse<MentorshipResponse>(callback, {
      responseMessage: RESPONSE_CODES["1"],
      responseCode: "1",
      responseData: event.responseData,
    });
  } catch (error) {
    return makeLambdaResponse<MentorshipResponse>(callback, {
      responseMessage: RESPONSE_CODES["-1"],
      responseCode: "-1",
      responseData: event.responseData,
    });
  }
};

export default catcherMentorship;
