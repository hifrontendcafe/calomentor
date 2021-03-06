import { Handler } from "aws-lambda";
import { RESPONSE_CODES, STATUS, TIMESLOT_STATUS, WHOCANCELED } from "../../../constants";
import { cancelMail, CancelMailParams } from "../../../mails/cancel";
import {
  getMentorshipById,
  updateMentorship,
} from "../../../repository/mentorship";
import {
  removeMenteeFromTimeSlot,
  updateTimeslotStatus,
} from "../../../repository/timeSlot";
import { ICalStatus, MentorshipResponse } from "../../../types";
import { sendMessageUserToCalobot } from "../../../utils/bot";
import { getUnixTime, toDateString, toTimeString } from "../../../utils/dates";
import { createICS } from "../../../utils/ical";
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
    mentorship: {
      mentorName,
      menteeName,
      mentorshipId,
      mentorEmail,
      menteeEmail,
      mentorTimezone,
      menteeTimezone,
      menteeId,
      mentorId,
      mentorship_duration
    }
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
          cancel_cause: "No fue confirmada la mentoria con anticipaci??n.",
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
          duration: mentorship_duration
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
          duration: mentorship_duration
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
        description: `??Hola! <@${menteeId}>. Tu mentoria con <@${mentorId}>. Debido a que no confirmaste la misma con anterioridad. En caso de error o por cualquier consulta relacionada a la mentor??a, pod??s comunicarte v??a correo electr??nico con el staff a frontendcafe@gmail.com.`,
        footer: "Cancelaci??n de la Mentoria",
        title: "Cancelaci??n de la Mentoria",
        timestamp: getUnixTime(mentorshipDate),
      });

      await sendMessageUserToCalobot(mentorId, {
        description: `??Hola! <@${mentorId}>. <@${menteeId}> ha cancelado una mentoria previamente agendada.`,
        footer: "Cancelaci??n de la Mentoria",
        title: "Cancelaci??n de la Mentoria",
        timestamp: getUnixTime(mentorshipDate),
      });
    }

    return makeLambdaResponse<MentorshipResponse>(callback, {
      responseMessage: RESPONSE_CODES["1"],
      responseCode: "1",
      responseData,
      isConfirm,
      confirmationAttempt,
      reminderAttempt,
    });
  } catch (error) {
    return makeLambdaResponse<MentorshipResponse>(callback, {
      responseMessage: RESPONSE_CODES["-1"],
      responseCode: "-1",
      responseData,
      isConfirm: false,
      confirmationAttempt,
      reminderAttempt,
    });
  }
};

export default checkConfirmFunction;
