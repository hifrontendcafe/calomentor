import { Handler } from "aws-lambda";
import { RESPONSE_CODES } from "../../../constants";
import { feedbackMail } from "../../../mails/feedback";
import { MentorshipResponse } from "../../../types";
import { makeLambdaResponse } from "../../../utils/makeResponses";
import { sendEmail } from "../../../utils/sendEmail";

const sendFeedbackFormMentorship: Handler = (event, _, callback): void => {
  const {
    responseData: {
      mentorship: { menteeEmail, menteeName },
      token,
    },
  } = event;

  const htmlMentee = feedbackMail({
    menteeName,
    feedbackLink: `${process.env.BASE_FRONT_URL}/feedback?token=${token}`,
  });
  sendEmail(menteeEmail, `Hola ${menteeName}!`, htmlMentee);
  return makeLambdaResponse<MentorshipResponse>(callback, {
    responseMessage: RESPONSE_CODES["0"],
    responseCode: "0",
    responseData: event.responseData,
  });
};

export default sendFeedbackFormMentorship;
