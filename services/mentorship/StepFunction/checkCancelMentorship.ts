import { Handler } from "aws-lambda";
import { RESPONSE_CODES, STATUS } from "../../../constants";
import { getMentorshipById } from "../../../repository/mentorship";
import { MentorshipResponse } from "../../../types";
import { makeLambdaResponse } from "../../../utils/makeResponses";
import { verifyToken } from "../../../utils/token";

const checkCancelFunction: Handler = async (event, _, callback) => {
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
      isCancel: mentorship_status === STATUS.CANCEL,
    });
  } catch (error) {
    return makeLambdaResponse<MentorshipResponse>(callback, {
      responseMessage: RESPONSE_CODES["0"],
      responseCode: "0",
      responseData: event.responseData,
      isCancel: false,
    });
  }
};

export default checkCancelFunction;
