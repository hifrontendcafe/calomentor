import { APIGatewayProxyHandler } from "aws-lambda";
import { STATUS } from "../../../constants";
import { Mentorship } from "../../../types";
import { makeErrorResponse, makeSuccessResponse } from "../../../utils/makeResponses";
import { v4 as uuidv4 } from "uuid";
import {
  addMenteeToTimeSlot,
  fillTimeSlot,
  getTimeSlotById,
} from "../../../repository/timeSlot";
import {
  substractTime,
  toDateString,
  toTimeString,
} from "../../../utils/dates";
import { getUserById } from "../../../repository/user";
import { getToken } from "../../../utils/token";
import { createMentorship } from "../../../repository/mentorship";
import { confirmationMail } from "../../../mails/confirmation";
import { sendEmail } from "../../../utils/sendEmail";
import { createICS } from "../../../utils/ical";

const createMentorshipAPI: APIGatewayProxyHandler = async (event) => {
  const {
    mentor_id,
    mentee_id,
    mentee_name,
    mentee_username_discord,
    mentee_email,
    mentee_timezone,
    info,
    time_slot_id,
  } = JSON.parse(event.body);

  if (!mentor_id || !mentee_id || !mentee_email || !time_slot_id) {
    return makeErrorResponse(500, "-100");
  }

  const mentorship: Mentorship = {
    id: uuidv4(),
    mentor_id,
    mentor_email: null,
    mentor_name: null,
    mentorship_token: null,
    mentee_id,
    mentee_name,
    mentee_username_discord,
    mentee_email,
    mentee_timezone,
    info,
    mentorship_status: STATUS.ACTIVE,
    time_slot_id,
    cancel_cause: null,
    who_cancel: null,
    feedback_mentee: null,
    feedback_stars: null,
    feedback_mentee_private: null,
    warning_info: null,
  };

  try {
    const {
      Item: { date },
    } = await getTimeSlotById(mentorship.time_slot_id);

    if (!date) {
      return makeErrorResponse(500, "-103");
    }

    const mentorshipDate = new Date(date);

    const {
      Item: { email, full_name, timezone },
    } = await getUserById(mentor_id);

    if (!email && !full_name) {
      return makeErrorResponse(500, "-101");
    }

    mentorship.mentor_email = email;
    mentorship.mentor_name = full_name;
    mentorship.mentorship_token = getToken({
      menteeEmail: mentorship.mentee_email,
      mentorshipId: mentorship.id,
      date: mentorshipDate.getTime(),
    });

    await createMentorship(mentorship);

    // update timeslot selected
    await fillTimeSlot(mentorship.time_slot_id);
    await addMenteeToTimeSlot(mentorship.time_slot_id, {
      id: mentee_id,
      username: mentee_username_discord,
      mentorship_token: mentorship.mentorship_token,
    });

    // send communications
    const htmlMentee = confirmationMail({
      mentorName: full_name,
      menteeName: mentee_name,
      date: toDateString(mentorshipDate),
      time: toTimeString(mentorshipDate),
      cancelLink: `${process.env.BASE_FRONT_URL}/cancel?token=${mentorship.mentorship_token}`,
      forMentor: false,
    });
    sendEmail(
      mentorship.mentee_email,
      `Hola ${mentee_name}!`,
      htmlMentee,
      createICS(mentorshipDate, full_name, {
        menteeEmail: mentee_email,
        menteeName: mentee_name,
        mentorEmail: email,
        mentorName: full_name,
        timezone: "America/Argentina/Buenos_Aires",
      })
    );
    const htmlMentor = confirmationMail({
      mentorName: full_name,
      menteeName: mentee_name,
      date: toDateString(mentorshipDate),
      time: toTimeString(mentorshipDate),
      cancelLink: `${process.env.BASE_FRONT_URL}/cancel?token=${mentorship.mentorship_token}`,
      forMentor: true,
    });
    sendEmail(
      email,
      `Hola ${full_name}!`,
      htmlMentor,
      createICS(mentorshipDate, mentee_name, {
        menteeEmail: mentee_email,
        menteeName: mentee_name,
        mentorEmail: email,
        mentorName: full_name,
        timezone: "America/Argentina/Buenos_Aires",
      })
    );

    const AWS = require("aws-sdk");
    const stepfunctions = new AWS.StepFunctions();
    const params = {
      // Este string lo podemos manejar por envs, es la forma de llamar servicios externos a la lambda o cualquier otro servicio de aws
      stateMachineArn: process.env.STATE_MACHINE_ARN,
      // el input son los datos que le tenemos que pasar a la state machine para que vaya pasando de paso a paso
      input: JSON.stringify({
        mentorId: mentor_id,
        menteeId: mentee_id,
        menteeName: mentee_name,
        menteeEmail: mentee_email,
        menteeTimezone: mentee_timezone,
        mentorTimezone: timezone,
        mentorName: full_name,
        mentorEmail: email,
        mentorshipDate,
        token: mentorship.mentorship_token,
      }),
    };
    // inicio de la state machine con los parametros que definimos antes
    stepfunctions.startExecution(params, (err, data) => {
      if(err) {
        return makeErrorResponse(500, "-102", err);
      }
      return makeSuccessResponse(data, "100")
    });
  } catch (error) {
    return makeErrorResponse(500, "-102", error);
  }
};

export default createMentorshipAPI;
