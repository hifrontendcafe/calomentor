import { APIGatewayProxyHandler } from "aws-lambda";
import { STATUS } from "../../../constants";
import {
  getMentorshipById,
  updateMentorship,
} from "../../../repository/mentorship";
import {
  makeErrorResponse,
  makeSuccessResponse,
} from "../../../utils/makeResponses";
import { verifyToken } from "../../../utils/token";

const confirmationMentorship: APIGatewayProxyHandler = async (event) => {
  const { mentorship_token } = JSON.parse(event.body);
  const tokenData = verifyToken(mentorship_token);

  try {
    const mentorship = await getMentorshipById(tokenData.mentorshipId);

    if (mentorship.Item?.mentorship_status !== STATUS.ACTIVE) {
      return makeErrorResponse(400, "-109");
    }

    const { Attributes } = await updateMentorship(
      tokenData.mentorshipId,
      { mentorship_status: STATUS.CONFIRMED },
      ["mentorship_status"]
    );
    return makeSuccessResponse(Attributes, "101");
  } catch (error) {
    return makeErrorResponse(400, "-110", error);
  }
};

export default confirmationMentorship;
