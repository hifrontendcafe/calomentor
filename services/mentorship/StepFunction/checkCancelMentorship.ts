import { Handler } from "aws-lambda";
import { RESPONSE_CODES, STATUS } from "../../../constants";
import { getMentorshipById } from "../../../repository/mentorship";
import { MentorshipResponse } from "../../../types";
import { makeLambdaResponse } from "../../../utils/makeResponses";
import { verifyToken } from "../../../utils/token";

const checkCancelFunction: Handler = async ({confirmationAttempt, reminderAttempt, responseData}, _, callback) => {
  const { mentorship_token } = responseData;
  const tokenData = verifyToken(mentorship_token);

  try {
    const {
      Item: { mentorship_status },
    } = await getMentorshipById(tokenData.mentorshipId);

    return makeLambdaResponse<MentorshipResponse>(callback, {
      responseMessage: RESPONSE_CODES["0"],
      responseCode: "0",
      responseData,
      confirmationAttempt,
      reminderAttempt,
      isCancel: mentorship_status === STATUS.CANCEL,
    });
  } catch (error) {
    return makeLambdaResponse<MentorshipResponse>(callback, {
      responseMessage: RESPONSE_CODES["0"],
      responseCode: "0",
      responseData,
      confirmationAttempt,
      reminderAttempt,
      isCancel: false,
    });
  }
};

export default checkCancelFunction;
