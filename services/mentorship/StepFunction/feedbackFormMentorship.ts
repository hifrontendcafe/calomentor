import { Handler } from "aws-lambda";
import { RESPONSE_CODES } from "../../../constants";
import { feedbackMail } from "../../../mails/feedback";
import { MentorshipResponse } from "../../../types";
import { removeRoleCalobot, sendMessageUserToCalobot } from "../../../utils/bot";
import { getUnixTime } from "../../../utils/dates";
import { makeLambdaResponse } from "../../../utils/makeResponses";
import { sendEmail } from "../../../utils/sendEmail";

const sendFeedbackFormMentorship: Handler = async (event, _, callback): Promise<void> => {
  const {
    responseData: {
      mentorship: { menteeEmail, menteeName, mentorName, menteeId, mentorId },
      mentorship_token,
      mentorshipDate
    },
  } = event;

  const date = new Date(mentorshipDate)

  const htmlMentee = feedbackMail({
    menteeName,
    feedbackLink: `${process.env.BASE_FRONT_URL}/feedback?mentorship_token=${mentorship_token}`,
    mentorName
  });
  sendEmail(menteeEmail, `Hola ${menteeName}!`, htmlMentee);

  await removeRoleCalobot(menteeId)

  await sendMessageUserToCalobot(menteeId, {
    description: `¡Hola! <@${menteeId}>. Como parte del proceso de mejora continua de la iniciativa Mentorías, te solicitamos que, una vez finalizada tu sesión con <@${mentorId}>, completes la siguiente encuesta de feedback, en la que podrás puntuar la sesión y dejarnos tus sugerencias y comentarios.`,
    footer: "🙏 ¡Esperamos hayas tenido una buena experiencia!",
    title: "🙏 ¡Esperamos hayas tenido una buena experiencia!",
    timestamp: getUnixTime(date),
  });
  
  return makeLambdaResponse<MentorshipResponse>(callback, {
    responseMessage: RESPONSE_CODES["1"],
    responseCode: "1",
    responseData: event.responseData,
  });
};

export default sendFeedbackFormMentorship;
