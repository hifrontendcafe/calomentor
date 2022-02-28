import { Handler } from "aws-lambda";
import { RESPONSE_CODES } from "../../../constants";
import { reminderMail } from "../../../mails/reminder";
import { MentorshipRequestBody, MentorshipResponse } from "../../../types";
import {
  toDateString,
  toTimeString,
  getUnixTime,
  distanceFromNow,
} from "../../../utils/dates";
import { createICS } from "../../../utils/ical";
import {
  sendMessageToCalobot,
  sendMessageUserToCalobot,
} from "../../../utils/bot";
import { makeLambdaResponse } from "../../../utils/makeResponses";
import { sendEmail } from "../../../utils/sendEmail";

const reminderMentorship: Handler = async (event, _, callback) => {
  const {
    responseData: {
      mentorship: {
        mentorEmail,
        menteeEmail,
        mentorName,
        menteeName,
        menteeTimezone,
        mentorTimezone,
        mentorshipId,
        menteeId,
        mentorId,
        mentorship_duration
      },
      mentorshipDate,
    },
    confirmationAttempt,
    reminderAttempt,
  } = event;
  const date = new Date(mentorshipDate);

  try {
    const htmlMentee = reminderMail({
      mentorName,
      menteeName,
      date: toDateString(mentorshipDate, menteeTimezone),
      time: toTimeString(mentorshipDate, menteeTimezone),
      forMentor: false,
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
        duration: mentorship_duration
      })
    );
    const htmlMentor = reminderMail({
      mentorName,
      menteeName,
      date: toDateString(mentorshipDate, mentorTimezone),
      time: toTimeString(mentorshipDate, mentorTimezone),
      forMentor: true,
    });
    sendEmail(
      mentorEmail,
      `Hola ${mentorName}!`,
      htmlMentor,
      createICS(date, menteeName, {
        mentorshipId,
        menteeEmail,
        menteeName,
        mentorEmail,
        mentorName,
        timezone: mentorTimezone,
        duration: mentorship_duration
      })
    );

    await sendMessageToCalobot({
      description: `¡Hola! <@${menteeId}> tu mentoria con <@${mentorId}> se realizara en los canales de voz llamados salas ${distanceFromNow(
        mentorshipDate
      )}.`,
      footer: "⏰ Recordatorio de la Mentoria",
      title: "⏰ Recordatorio de la Mentoria",
      timestamp: getUnixTime(date),
      mentions: [parseInt(menteeId), parseInt(mentorId)],
    });

    await sendMessageUserToCalobot(menteeId, {
      description: `¡Hola! <@${menteeId}>. Te recordamos que confirmaste una mentoria con <@${mentorId}>. La misma se llevará a cabo en una de las salas de voz del servidor de Discord de FrontendCafé.`,
      footer: "⏰ Recordatorio de la Mentoria",
      title: "⏰ Recordatorio de la Mentoria",
      timestamp: getUnixTime(date),
    });

    await sendMessageUserToCalobot(mentorId, {
      description: `¡Hola! <@${mentorId}>. Te recordamos que tenes una mentoria confirmada con <@${menteeId}>. La misma se llevará a cabo en una de las salas de voz del servidor de Discord de FrontendCafé.`,
      footer: "⏰ Recordatorio de la Mentoria",
      title: "⏰ Recordatorio de la Mentoria",
      timestamp: getUnixTime(date),
    });

    return makeLambdaResponse<MentorshipResponse>(callback, {
      responseMessage: RESPONSE_CODES["1"],
      responseCode: "1",
      responseData: event.responseData,
      confirmationAttempt,
      reminderAttempt: reminderAttempt + 1,
    });
  } catch (error) {
    return makeLambdaResponse<MentorshipResponse>(callback, {
      responseMessage: RESPONSE_CODES["-1"],
      responseCode: "-1",
      responseData: event.responseData,
      confirmationAttempt,
      reminderAttempt,
    });
  }
};

export default reminderMentorship;
