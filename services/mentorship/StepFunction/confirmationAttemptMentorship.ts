import { Handler } from "aws-lambda";
import { RESPONSE_CODES } from "../../../constants";
import { confirmMentorshipMail } from "../../../mails/confirmMentorship";
import { MentorshipResponse } from "../../../types";
import { sendMessageUserToCalobot } from "../../../utils/bot";
import { getUnixTime, toDateString, toTimeString } from "../../../utils/dates";
import { createICS } from "../../../utils/ical";
import { makeLambdaResponse } from "../../../utils/makeResponses";
import { sendEmail } from "../../../utils/sendEmail";

const confirmationAttemptMentorship: Handler = async (event, _, callback) => {
  const {
    responseData: {
      mentorship: {
        mentorEmail,
        menteeEmail,
        mentorName,
        menteeName,
        menteeTimezone,
        mentorshipId,
        menteeId,
        mentorId,
        mentorship_duration,
      },
      mentorshipDate,
      mentorship_token,
    },
    confirmationAttempt,
    reminderAttempt,
  } = event;
  const date = new Date(mentorshipDate);

  try {
    const htmlMentee = confirmMentorshipMail({
      mentorName,
      menteeName,
      date: toDateString(mentorshipDate, menteeTimezone),
      time: toTimeString(mentorshipDate, menteeTimezone),
      forMentor: false,
      cancelLink: `${process.env.BASE_FRONT_URL}/cancel?mentorship_token=${mentorship_token}`,
      confirmationLink: `${process.env.BASE_FRONT_URL}/confirmation?mentorship_token=${mentorship_token}`,
    });
    sendEmail(
      menteeEmail,
      `Hola ${menteeName}!`,
      htmlMentee,
      createICS(date, menteeName, {
        mentorshipId,
        menteeEmail,
        menteeName,
        mentorEmail,
        mentorName,
        timezone: menteeTimezone,
        duration: mentorship_duration,
      })
    );

    await sendMessageUserToCalobot(menteeId, {
      description: `¡Hola! <@${menteeId}>. Te recordamos que registraste una mentoría con <@${mentorId}>  que aún se encuentra sin confirmar. Deberás confirmar la sesión vía correo electrónico con un tiempo límite de 24hs antes del día y la hora agendadas. En caso contrario, la mentoría se cancelará automáticamente.`,
      footer: "⏰ Recordatorio de la Mentoria",
      title: "⏰ Recordatorio de la Mentoria",
      timestamp: getUnixTime(mentorshipDate),
    });

    return makeLambdaResponse<MentorshipResponse>(callback, {
      responseMessage: RESPONSE_CODES["0"],
      responseCode: "0",
      responseData: event.responseData,
      confirmationAttempt: confirmationAttempt + 1,
      reminderAttempt,
    });
  } catch (error) {
    return makeLambdaResponse<MentorshipResponse>(callback, {
      responseMessage: RESPONSE_CODES["-1"],
      responseCode: "-1",
      responseData: event.responseData,
      reminderAttempt,
    });
  }
};

export default confirmationAttemptMentorship;
