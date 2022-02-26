import { APIGatewayProxyHandler } from "aws-lambda";
import { STATUS, WHOCANCELED } from "../../../constants";
import { cancelMail, CancelMailParams } from "../../../mails/cancel";
import {
  getMentorshipById,
  updateMentorship,
} from "../../../repository/mentorship";
import {
  freeTimeSlot,
  removeMenteeFromTimeSlot,
} from "../../../repository/timeSlot";
import {
  sendMessageUserToCalobot,
} from "../../../utils/bot";
import { getUnixTime, toDateString, toTimeString } from "../../../utils/dates";
import { createICS, ICalStatus } from "../../../utils/ical";
import {
  makeErrorResponse,
  makeSuccessResponse,
} from "../../../utils/makeResponses";
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
    cancelMail({ ...emailData, forMentor: false }),
    menteeSendEmail.icalContent
  );

  sendEmail(
    mentorSendEmail.to,
    mentorSendEmail.subject,
    cancelMail({ ...emailData, forMentor: true }),
    mentorSendEmail.icalContent
  );
}

const cancelMentorship: APIGatewayProxyHandler = async (event) => {
  const { cancel_cause, who_canceled, mentorship_token } = JSON.parse(
    event.body
  );
  const tokenData = verifyToken(mentorship_token);

  if (!cancel_cause || !Object.values(WHOCANCELED).includes(who_canceled)) {
    return makeErrorResponse(400, "-120");
  }

  try {
    const mentorship = await getMentorshipById(tokenData.mentorshipId);

    if (mentorship.Item?.mentorship_status === STATUS.CANCEL) {
      return makeErrorResponse(400, "-109");
    }

    await freeTimeSlot(mentorship.Item?.time_slot_id);
    await removeMenteeFromTimeSlot(mentorship.Item?.time_slot_id);

    const mentorshipUpdated = await updateMentorship(
      tokenData.mentorshipId,
      {
        mentorship_status: STATUS.CANCEL,
        cancel_cause: cancel_cause,
        who_canceled: who_canceled,
      },
      ["mentorship_status", "cancel_cause", "who_canceled"]
    );

    const {
      mentee_name,
      mentee_email,
      mentor_name,
      mentor_email,
      mentee_timezone,
      mentor_timezone,
      mentee_id,
      mentor_id,
      id,
    } = mentorshipUpdated.Attributes;

    const mentorshipDate = new Date(tokenData.date);
    const menteeICS = createICS(
      mentorshipDate,
      mentor_name,
      {
        mentorshipId: id,
        menteeEmail: mentee_email,
        menteeName: mentee_name,
        mentorEmail: mentor_email,
        mentorName: mentor_name,
        timezone: mentee_timezone,
      },
      ICalStatus.CANCEL
    );

    const mentorICS = createICS(
      mentorshipDate,
      mentee_name,
      {
        mentorshipId: id,
        menteeEmail: mentee_email,
        menteeName: mentee_name,
        mentorEmail: mentor_email,
        mentorName: mentor_name,
        timezone: mentor_timezone,
      },
      ICalStatus.CANCEL
    );

    const emailData = {
      mentorName: mentor_name,
      menteeName: mentee_name,
      date: toDateString(mentorshipDate, mentee_timezone),
      time: toTimeString(mentorshipDate, mentee_timezone),
    };

    const sendMenteeData = {
      to: mentee_email,
      subject: `Hola ${mentee_name}!`,
      icalContent: menteeICS,
    };

    const sendMentorData = {
      to: mentor_email,
      subject: `Hola ${mentor_name}!`,
      icalContent: mentorICS,
    };

    sendEmails(emailData, sendMenteeData, sendMentorData);

    await sendMessageUserToCalobot(mentee_id, {
      description: `¡Hola! <@${mentee_id}>. Tu mentoria con <@${mentor_id}>. En caso de error o por cualquier consulta relacionada a la mentoría, podés comunicarte vía correo electrónico con el staff a frontendcafe@gmail.com.`,
      footer: "Cancelación de la Mentoria",
      title: "Cancelación de la Mentoria",
      timestamp: getUnixTime(mentorshipDate),
    });

    await sendMessageUserToCalobot(mentor_id, {
      description: `¡Hola! <@${mentor_id}>. <@${mentee_id}> ha cancelado una mentoria previamente agendada.`,
      footer: "Cancelación de la Mentoria",
      title: "Cancelación de la Mentoria",
      timestamp: getUnixTime(mentorshipDate),
    });

    return makeSuccessResponse(mentorshipUpdated.Attributes);
  } catch (error) {
    return makeErrorResponse(500, "-104");
  }
};

export default cancelMentorship;
