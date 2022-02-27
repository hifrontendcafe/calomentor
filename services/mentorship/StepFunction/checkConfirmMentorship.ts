import { Handler } from "aws-lambda";
import { RESPONSE_CODES, STATUS, WHOCANCELED } from "../../../constants";
import { cancelMail, CancelMailParams } from "../../../mails/cancel";
import {
  getMentorshipById,
  updateMentorship,
} from "../../../repository/mentorship";
import {
  removeMenteeFromTimeSlot,
  updateTimeslotStatus,
} from "../../../repository/timeSlot";
import { MentorshipResponse, TIMESLOT_STATUS } from "../../../types";
import { sendMessageUserToCalobot } from "../../../utils/bot";
import { getUnixTime, toDateString, toTimeString } from "../../../utils/dates";
import { createICS, ICalStatus } from "../../../utils/ical";
import { makeLambdaResponse } from "../../../utils/makeResponses";
import { sendEmail } from "../../../utils/sendEmail";
import { verifyToken } from "../../../utils/token";

interface SendEmailParams {
  to: string;
  subject: string;
  icalContent: string;
}

function sendEmails(
  emailData: Omit<CancelMailParams, "forMentor">,
  menteeSendEmail: SendEmailParams,
  mentorSendEmail: SendEmailParams
) {
  sendEmail(
    menteeSendEmail.to,
    menteeSendEmail.subject,
    cancelMail({ ...emailData, forMentor: false, isNotConfirmed: true }),
    menteeSendEmail.icalContent
  );

  sendEmail(
    mentorSendEmail.to,
    mentorSendEmail.subject,
    cancelMail({ ...emailData, forMentor: true, isNotConfirmed: true }),
    mentorSendEmail.icalContent
  );
}

const checkConfirmFunction: Handler = async (
  { reminderAttempt, confirmationAttempt, responseData },
  _,
  callback
) => {
  const {
    mentorship_token,
    mentorName,
    menteeName,
    mentorshipId,
    mentorEmail,
    menteeEmail,
    mentorTimezone,
    menteeTimezone,
    menteeId,
    mentorId,
  } = responseData;
  const tokenData = verifyToken(mentorship_token);

  try {
    const {
      Item: { mentorship_status },
    } = await getMentorshipById(tokenData.mentorshipId);

    const isConfirm = mentorship_status === STATUS.CONFIRMED;
    // If is the second confirmation check and is still not confirmed the mentorship
    // will be canceled
    if (confirmationAttempt === 1 && !isConfirm) {
      const mentorshipDate = new Date(tokenData.date);

      const mentorship = await getMentorshipById(tokenData.mentorshipId);

      await updateTimeslotStatus(mentorship.Item?.time_slot_id, TIMESLOT_STATUS.FREE);
      await removeMenteeFromTimeSlot(mentorship.Item?.time_slot_id);
      await updateMentorship(
        tokenData.mentorshipId,
        {
          mentorship_status: STATUS.CANCEL,
          cancel_cause: "No fue confirmada la mentoria con anticipación.",
          who_canceled: WHOCANCELED.MENTEE,
        },
        ["mentorship_status", "cancel_cause", "who_canceled"]
      );

      const menteeICS = createICS(
        mentorshipDate,
        mentorName,
        {
          mentorshipId,
          menteeEmail,
          menteeName,
          mentorEmail,
          mentorName,
          timezone: menteeTimezone,
        },
        ICalStatus.CANCEL
      );

      const mentorICS = createICS(
        mentorshipDate,
        menteeName,
        {
          mentorshipId,
          menteeEmail,
          menteeName,
          mentorEmail,
          mentorName,
          timezone: mentorTimezone,
        },
        ICalStatus.CANCEL
      );

      const emailData = {
        mentorName,
        menteeName,
        date: toDateString(mentorshipDate, mentorTimezone),
        time: toTimeString(mentorshipDate, menteeTimezone),
      };

      const sendMenteeData = {
        to: menteeEmail,
        subject: `Hola ${menteeName}!`,
        icalContent: menteeICS,
      };

      const sendMentorData = {
        to: mentorEmail,
        subject: `Hola ${mentorName}!`,
        icalContent: mentorICS,
      };

      sendEmails(emailData, sendMenteeData, sendMentorData);

      await sendMessageUserToCalobot(menteeId, {
        description: `¡Hola! <@${menteeId}>. Tu mentoria con <@${mentorId}>. Debido a que no confirmaste la misma con anterioridad. En caso de error o por cualquier consulta relacionada a la mentoría, podés comunicarte vía correo electrónico con el staff a frontendcafe@gmail.com.`,
        footer: "Cancelación de la Mentoria",
        title: "Cancelación de la Mentoria",
        timestamp: getUnixTime(mentorshipDate),
      });

      await sendMessageUserToCalobot(mentorId, {
        description: `¡Hola! <@${mentorId}>. <@${menteeId}> ha cancelado una mentoria previamente agendada.`,
        footer: "Cancelación de la Mentoria",
        title: "Cancelación de la Mentoria",
        timestamp: getUnixTime(mentorshipDate),
      });
    }

    return makeLambdaResponse<MentorshipResponse>(callback, {
      responseMessage: RESPONSE_CODES["0"],
      responseCode: "0",
      responseData,
      isConfirm,
      confirmationAttempt,
      reminderAttempt,
    });
  } catch (error) {
    return makeLambdaResponse<MentorshipResponse>(callback, {
      responseMessage: RESPONSE_CODES["0"],
      responseCode: "0",
      responseData,
      isConfirm: false,
      confirmationAttempt,
      reminderAttempt,
    });
  }
};

export default checkConfirmFunction;
