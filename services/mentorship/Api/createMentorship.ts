import { APIGatewayProxyHandler } from "aws-lambda";
import { StepFunctions } from "aws-sdk";
import { v4 as uuidv4 } from "uuid";
import { STATUS, TIMESLOT_STATUS } from "../../../constants";
import { confirmationMail } from "../../../mails/confirmation";
import { createMentorship } from "../../../repository/mentorship";
import {
  addMenteeToTimeSlot,
  getTimeSlotById,
  updateTimeslotStatus,
} from "../../../repository/timeSlot";
import { getUserById } from "../../../repository/user";
import { getWarningsData } from "../../../repository/warning";
import { Mentorship } from "../../../types";
import {
  sendMessageToCalobot,
  sendMessageUserToCalobot,
} from "../../../utils/bot";
import { getUnixTime, toDateString, toTimeString } from "../../../utils/dates";
import { createICS } from "../../../utils/ical";
import {
  makeErrorResponse,
  makeSuccessResponse,
} from "../../../utils/makeResponses";
import { sendEmail } from "../../../utils/sendEmail";
import { getToken } from "../../../utils/token";

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

  // check if the mentee has any warning, if it has the system reject the mentorship request
  const warning = await getWarningsData({id: mentee_id});

  if (warning.Items.length > 0) {
    return makeErrorResponse(403, "-118");
  }

  const mentorship: Mentorship = {
    id: uuidv4(),
    mentor_id,
    mentor_email: null,
    mentor_name: null,
    mentor_username_discord: null,
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
    who_canceled: null,
    feedback_mentee: null,
    feedback_stars: null,
    feedback_mentee_private: null,
    warning_info: null,
    mentor_timezone: null,
    mentorship_create_date: null,
    from_bot: false,
    searcheable_mentor_name: null,
    searcheable_mentor_username_discord: null,
    searcheable_mentee_name: mentee_username_discord.toLowerCase(),
    searcheable_mentee_username_discord: mentee_username_discord.toLowerCase(),
  };

  try {
    const { Item: timeslot } = await getTimeSlotById(mentorship.time_slot_id);

    const { date, timeslot_status, duration } = timeslot;

    if (!date) {
      return makeErrorResponse(500, "-103");
    }

    if (timeslot_status !== TIMESLOT_STATUS.FREE) {
      return makeErrorResponse(500, "-119");
    }

    const mentorshipDate = new Date(date);

    const { Item: user } = await getUserById(mentor_id);

    const { email, full_name, user_timezone } = user;

    if (!email && !full_name) {
      return makeErrorResponse(500, "-101");
    }

    mentorship.mentor_email = email;
    mentorship.mentor_name = full_name;
    mentorship.searcheable_mentor_name = full_name.toLowerCase();
    mentorship.mentorship_token = getToken({
      menteeEmail: mentorship.mentee_email,
      mentorshipId: mentorship.id,
      date: mentorshipDate.getTime(),
    });
    mentorship.mentor_timezone = user_timezone;

    await createMentorship(mentorship);

    // Update timeslot selected
    await updateTimeslotStatus(
      mentorship.time_slot_id,
      TIMESLOT_STATUS.OCCUPIED
    );
    await addMenteeToTimeSlot(mentorship.time_slot_id, {
      id: mentee_id,
      username: mentee_username_discord,
      mentorship_token: mentorship.mentorship_token,
    });

    // Send communications
    const htmlMentee = confirmationMail({
      mentorName: full_name,
      menteeName: mentee_name,
      date: toDateString(mentorshipDate, mentee_timezone),
      time: toTimeString(mentorshipDate, mentee_timezone),
      cancelLink: `${process.env.BASE_FRONT_URL}/cancel?mentorship_token=${mentorship.mentorship_token}`,
      forMentor: false,
    });
    sendEmail(
      mentorship.mentee_email,
      `Hola ${mentee_name}!`,
      htmlMentee,
      createICS(mentorshipDate, full_name, {
        mentorshipId: mentorship.id,
        menteeEmail: mentee_email,
        menteeName: mentee_name,
        mentorEmail: email,
        mentorName: full_name,
        timezone: mentee_timezone,
        duration,
      })
    );

    const htmlMentor = confirmationMail({
      mentorName: full_name,
      menteeName: mentee_name,
      date: toDateString(mentorshipDate, user_timezone),
      time: toTimeString(mentorshipDate, user_timezone),
      cancelLink: `${process.env.BASE_FRONT_URL}/cancel?mentorship_token=${mentorship.mentorship_token}&who_canceled=MENTOR`,
      forMentor: true,
    });
    sendEmail(
      email,
      `Hola ${full_name}!`,
      htmlMentor,
      createICS(mentorshipDate, mentee_name, {
        mentorshipId: mentorship.id,
        menteeEmail: mentee_email,
        menteeName: mentee_name,
        mentorEmail: email,
        mentorName: full_name,
        timezone: user_timezone,
        duration,
      })
    );

    await sendMessageToCalobot({
      description: `??Hola! <@${mentee_id}> tu solicitud para una sesi??n de mentoria con <@${mentor_id}> ha sido registrada exitosamente. Deber??s confirmar la misma v??a correo electr??nico con un tiempo l??mite 24hs antes de la fecha y hora de registraci??n. En caso contrario se cancelar?? autom??ticamente la mentor??a.`,
      footer: "??? Solicitud de mentoria exitosa",
      title: "??? Solicitud de mentoria exitosa",
      timestamp: getUnixTime(mentorshipDate),
      mentions: [mentee_id, mentor_id],
    });

    await sendMessageUserToCalobot(mentee_id, {
      description: `??Hola! <@${mentee_id}>, tu mentor??a con <@${mentor_id}> fue registrada correctamente. Para llevar adelante la sesi??n, es obligatorio que env??es una confirmaci??n con un plazo m??ximo de 24 antes de que se desarrolle la misma.`,
      footer: "??? Solicitud de mentoria exitosa",
      title: "??? Solicitud de mentoria exitosa",
      timestamp: getUnixTime(mentorshipDate),
    });

    await sendMessageUserToCalobot(mentor_id, {
      description: `??Hola! <@${mentor_id}>, <@${mentee_id}> te ha agendado una mentor??a.`,
      footer: "??? Solicitud de mentoria exitosa",
      title: "??? Solicitud de mentoria exitosa",
      timestamp: getUnixTime(mentorshipDate),
    });

    const AWS = require("aws-sdk");
    const stepfunctions: StepFunctions = new AWS.StepFunctions();
    const params: StepFunctions.StartExecutionInput = {
      // This string is the address where we call the init of the createMentorship state machine.
      stateMachineArn: process.env.STATE_MACHINE_ARN,
      // This is the input that grab the init of the state machine for work from there
      input: JSON.stringify({
        mentorshipId: mentorship.id,
        mentorId: mentor_id,
        menteeId: mentee_id,
        menteeName: mentee_name,
        menteeEmail: mentee_email,
        menteeTimezone: mentee_timezone,
        mentorTimezone: user_timezone,
        mentorName: full_name,
        mentorEmail: email,
        mentorshipDate,
        mentorship_token: mentorship.mentorship_token,
        mentorship_duration: duration,
      }),
    };

    // The actual execution with the paramaters that we declare before
    const startSateMachine = await stepfunctions
      .startExecution(params)
      .promise();
    return makeSuccessResponse(startSateMachine, "100");
  } catch (error) {
    return makeErrorResponse(500, "-102", error.stack);
  }
};

const createMentorshipMatebot: APIGatewayProxyHandler = async (event) => {
  const {
    mentor_id,
    mentor_username_discord,
    mentee_id,
    mentee_username_discord,
    mentorship_date,
    mentee_email,
    mentor_email
  } = JSON.parse(event.body);

  if (
    !mentor_id ||
    !mentor_username_discord ||
    !mentee_id ||
    !mentee_username_discord
  ) {
    return makeErrorResponse(500, "-100");
  }

  try {
    // check if the mentee has any warning, if it has the system reject the mentorship request
    const warning = await getWarningsData({ id: mentee_id });

    if (warning.Items.length > 0) {
      return makeErrorResponse(403, "-118");
    }
  } catch (error) {
    return makeErrorResponse(500, "-102", error);
  }

  const date = mentorship_date || Date.now();

  const mentorship: Mentorship = {
    id: uuidv4(),
    mentor_id,
    mentor_username_discord,
    mentor_email: mentor_email ?? null,
    mentor_name: mentor_username_discord,
    mentorship_token: null,
    mentee_id,
    mentee_name: mentee_username_discord,
    mentee_username_discord,
    mentee_email: mentee_email ?? null,
    mentee_timezone: null,
    info: null,
    mentorship_status: STATUS.CONFIRMED,
    time_slot_id: null,
    cancel_cause: null,
    who_canceled: null,
    feedback_mentee: null,
    feedback_stars: null,
    feedback_mentee_private: null,
    warning_info: null,
    mentor_timezone: null,
    mentorship_create_date: String(date),
    from_bot: true,
    searcheable_mentor_name: mentor_username_discord.toLowerCase(),
    searcheable_mentor_username_discord: mentor_username_discord.toLowerCase(),
    searcheable_mentee_name: mentee_username_discord.toLowerCase(),
    searcheable_mentee_username_discord: mentee_username_discord.toLowerCase(),
  };

  mentorship.mentorship_token = getToken({
    menteeEmail: mentorship.mentee_email,
    mentorshipId: mentorship.id,
    date: date,
  });

  try {
    await createMentorship(mentorship);
  } catch (error) {
    return makeErrorResponse(500, "-102", error.stack);
  }

  return makeSuccessResponse({}, "100");
};

export { createMentorshipAPI, createMentorshipMatebot };
