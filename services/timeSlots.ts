import type { APIGatewayProxyHandler } from "aws-lambda";
import { v4 as uuidv4 } from "uuid";
import {
  addMenteeToTimeSlot as repositoryAddMenteeToTimeSlot,
  createTimeSlot,
  deleteTimeSlot as repositoryDeleteTimeSlot,
  getTimeSlotById as repositoryGetTimeSlotById,
  getTimeSlotsByUserId,
  updateTimeslotStatus,
} from "../repository/timeSlot";
import { TimeSlot, TIMESLOT_STATUS } from "../types";
import { addTime, dateIsBetween, isPastDate, isSameDate } from "../utils/dates";
import { makeErrorResponse, makeSuccessResponse } from "../utils/makeResponses";

export const addTimeSlot: APIGatewayProxyHandler = async (event) => {
  const { user_id, slot_date, duration = 60 } = JSON.parse(event.body);

  if (!user_id && !slot_date) {
    return makeErrorResponse(400, "-401");
  }

  const date = new Date(slot_date);

  if (isPastDate(date)) {
    return makeErrorResponse(400, "-402");
  }

  const { Items } = await getTimeSlotsByUserId(user_id);

  const timeslot = Items.find((timeslot) => {
    const isSame = isSameDate(new Date(timeslot.date), date);
    const timeslotFortyFiveBefore = addTime(
      new Date(timeslot.date),
      45,
      "minutes"
    );
    const hasSameBetween = dateIsBetween(
      date,
      new Date(timeslot.date),
      timeslotFortyFiveBefore
    );

    return isSame || hasSameBetween;
  });

  if (timeslot) {
    return makeErrorResponse(400, "-403");
  }

  const timeSlot: TimeSlot = {
    id: uuidv4(),
    user_id,
    date: date.getTime(),
    timeslot_status: TIMESLOT_STATUS.FREE,
    mentee_username: "",
    mentee_id: "",
    mentorship_token: "",
    duration,
  };

  try {
    await createTimeSlot(timeSlot);
  } catch (error) {
    return makeErrorResponse(400, "-404", error);
  }

  return makeSuccessResponse(timeSlot, "400");
};

export const getTimeSlotsByUser: APIGatewayProxyHandler = async (event) => {
  const { queryStringParameters, pathParameters } = event;

  let timeSlotsData: Awaited<ReturnType<typeof getTimeSlotsByUserId>>;

  try {
    timeSlotsData = await getTimeSlotsByUserId(pathParameters.id, {
      slotDate: queryStringParameters?.slot_date,
      onlyFree: queryStringParameters?.only_free === "true",
    });
  } catch (error) {
    return makeErrorResponse(400, "-405", error);
  }

  return makeSuccessResponse(timeSlotsData.Items);
};

export const getTimeSlotById: APIGatewayProxyHandler = async (event) => {
  const { pathParameters } = event;

  let timeSlotData: Awaited<ReturnType<typeof repositoryGetTimeSlotById>>;

  try {
    timeSlotData = await repositoryGetTimeSlotById(pathParameters?.id);
  } catch (error) {
    return makeErrorResponse(400, "-406", error);
  }

  if (!timeSlotData?.Item) {
    return makeErrorResponse(404, "-407");
  }

  return makeSuccessResponse(timeSlotData.Item);
};

export const updateTimeSlotState: APIGatewayProxyHandler = async (event) => {
  const {
    pathParameters: { id },
  } = event;

  if (!id) {
    return makeErrorResponse(400, "-408");
  }

  const { timeslot_status } = JSON.parse(event.body);

  try {
    const {
      Attributes: timeslot,
    }: Awaited<ReturnType<typeof updateTimeslotStatus>> =
      await updateTimeslotStatus(id, timeslot_status);
    return makeSuccessResponse(timeslot, "401");
  } catch (err) {
    return makeErrorResponse(400, "-409", err);
  }
};

export const addMenteeToTimeSlot: APIGatewayProxyHandler = async (event) => {
  const {
    pathParameters: { id },
  } = event;

  if (!id) {
    return makeErrorResponse(400, "-408");
  }

  const { mentee_username, mentee_id, mentorship_token } = JSON.parse(
    event.body
  );

  if (!mentee_username || !mentee_id || !mentorship_token) {
    return makeErrorResponse(400, "-410");
  }

  let timeSlot: TimeSlot | undefined;

  try {
    const timeSlotData = await repositoryAddMenteeToTimeSlot(id, {
      id: mentee_id,
      username: mentee_username,
      mentorship_token,
    });

    timeSlot = timeSlotData.Attributes;
  } catch (err) {
    return makeErrorResponse(400, "-409", err);
  }

  return makeSuccessResponse(timeSlot, "401");
};

export const deleteTimeSlot: APIGatewayProxyHandler = async (event) => {
  if (!event.pathParameters.id) {
    return makeErrorResponse(400, "-411");
  }

  let deletedTimeSlot: TimeSlot | undefined;

  try {
    const deletedResponseData = await repositoryDeleteTimeSlot(
      event.pathParameters.id
    );

    deletedTimeSlot = deletedResponseData.Attributes;
  } catch (err) {
    return makeErrorResponse(400, "-412", err);
  }

  if (deletedTimeSlot === undefined) {
    return makeErrorResponse(400, "-413");
  }

  return makeSuccessResponse(deletedTimeSlot, "402");
};
