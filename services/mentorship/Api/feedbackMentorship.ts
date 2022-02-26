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

const feedbackFormMentorship: APIGatewayProxyHandler = async (event) => {
  const {
    mentorship_token,
    feedback_mentee: feedback,
    feedback_mentee_private,
    feedback_stars: feedbackStars,
  } = JSON.parse(event.body);
  const tokenData = verifyToken(mentorship_token);

  try {
    const {
      Item: { mentorship_status, feedback_stars, feedback_mentee },
    } = await getMentorshipById(tokenData.mentorshipId);

    if (mentorship_status !== STATUS.CONFIRMED) {
      return makeErrorResponse(400, "-111");
    }

    if (feedback_stars > 0 && feedback_mentee !== "") {
      return makeErrorResponse(400, "-112");
    }

    const mentorshipUpdated = await updateMentorship(
      tokenData.mentorshipId,
      {
        feedback_mentee: feedback,
        feedback_mentee_private,
        feedback_stars: feedbackStars,
      },
      ["feedback_mentee", "feedback_mentee_private", "feedback_stars"]
    );

    return makeSuccessResponse(mentorshipUpdated.Attributes, "102");
  } catch (error) {
    return makeErrorResponse(500, "-110", error);
  }
};

export default feedbackFormMentorship;
