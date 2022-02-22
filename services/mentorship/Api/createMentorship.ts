import { APIGatewayProxyHandler } from "aws-lambda";
import { StepFunctions } from "aws-sdk";
import { v4 as uuidv4 } from "uuid";
import { STATUS } from "../../../constants";
import { confirmationMail } from "../../../mails/confirmation";
import { createMentorship } from "../../../repository/mentorship";
import {
  addMenteeToTimeSlot,
  fillTimeSlot,
  getTimeSlotById
} from "../../../repository/timeSlot";
import { getUserById } from "../../../repository/user";
import { getWarningsData } from "../../../repository/warning";
import { Mentorship } from "../../../types";
import { toDateString, toTimeString } from "../../../utils/dates";
import { createICS } from "../../../utils/ical";
import {
  makeErrorResponse,
  makeSuccessResponse
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
  const warning = await getWarningsData(mentee_id);

  if (warning.Items.length > 0) {
    return makeErrorResponse(500, "-118");
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
    mentor_timezone: null,
  };

  try {
    const {
      Item: { date, is_occupied },
    } = await getTimeSlotById(mentorship.time_slot_id);

    if (!date) {
      return makeErrorResponse(500, "-103");
    }

    if (is_occupied) {
      return makeErrorResponse(403, "-119");
    }

    const mentorshipDate = new Date(date);

    const {
      Item: { email, full_name, user_timezone },
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
    mentorship.mentor_timezone = user_timezone;

    await createMentorship(mentorship);

    // Update timeslot selected
    await fillTimeSlot(mentorship.time_slot_id);
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
      cancelLink: `${process.env.BASE_FRONT_URL}/cancel?token=${mentorship.mentorship_token}`,
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
      })
    );
    const htmlMentor = confirmationMail({
      mentorName: full_name,
      menteeName: mentee_name,
      date: toDateString(mentorshipDate, user_timezone),
      time: toTimeString(mentorshipDate, user_timezone),
      cancelLink: `${process.env.BASE_FRONT_URL}/cancel?token=${mentorship.mentorship_token}`,
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
      })
    );

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
        token: mentorship.mentorship_token,
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

export default createMentorshipAPI;