import { Handler } from "aws-lambda";
import { RESPONSE_CODES, STATUS } from "../../../constants";
import { getMentorshipById } from "../../../repository/mentorship";
import { MentorshipResponse } from "../../../types";
import { makeLambdaResponse } from "../../../utils/makeResponses";
import { verifyToken } from "../../../utils/token";

const checkConfirmFunction: Handler = async (event, _, callback) => {
  const { token } = event.responseData;
  const tokenData = verifyToken(token);

  try {
    const {
      Item: { mentorship_status },
    } = await getMentorshipById(tokenData.mentorshipId);

    return makeLambdaResponse<MentorshipResponse>(callback, {
      responseMessage: RESPONSE_CODES["0"],
      responseCode: "0",
      responseData: event.responseData,
      isConfirm: mentorship_status === STATUS.CONFIRMED,
    });
  } catch (error) {
    return makeLambdaResponse<MentorshipResponse>(callback, {
      responseMessage: RESPONSE_CODES["0"],
      responseCode: "0",
      responseData: event.responseData,
      isConfirm: false,
    });
  }
};

export default checkConfirmFunction;
