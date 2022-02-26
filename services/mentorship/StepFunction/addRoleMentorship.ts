import { Handler } from "aws-lambda";
import { RESPONSE_CODES } from "../../../constants";
import { MentorshipResponse } from "../../../types";
import { addRoleCalobot } from "../../../utils/bot";
import { makeLambdaResponse } from "../../../utils/makeResponses";

const addRoleMentorship: Handler = async (event,_,callback) => {
  try {
    await addRoleCalobot(event.responseData.mentorship.menteeId)
    return makeLambdaResponse<MentorshipResponse>(callback, {
      responseMessage: RESPONSE_CODES["0"],
      responseCode: "0",
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

export default addRoleMentorship;
