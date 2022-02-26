import type { APIGatewayProxyHandler } from "aws-lambda";
import { v4 as uuidv4 } from "uuid";
import {
  addMenteeToTimeSlot as repositoryAddMenteeToTimeSlot,
  createTimeSlot,
  deleteTimeSlot as repositoryDeleteTimeSlot,
  fillTimeSlot,
  freeTimeSlot,
  getTimeSlotById as repositoryGetTimeSlotById,
  getTimeSlotsByUserId
} from "../repository/timeSlot";
import { TimeSlot } from "../types";
import { addTime, dateIsBetween, isPastDate, isSameDate } from "../utils/dates";
import { makeErrorResponse, makeSuccessResponse } from "../utils/makeResponses";

export const addTimeSlot: APIGatewayProxyHandler = async (event) => {
  const { user_id, slot_date, duration = 60 } = JSON.parse(event.body);

  if (!user_id && !slot_date) {
    return makeErrorResponse(400, "-113");
  }

  const date = new Date(slot_date);

  if (isPastDate(date)) {
    return makeErrorResponse(400, "-114");
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

    return !isSame && hasSameBetween;
  });

  if (timeslot) {
    return makeErrorResponse(400, "-115");
  }

  const timeSlot: TimeSlot = {
    id: uuidv4(),
    user_id,
    date: date.getTime(),
    is_occupied: false,
    mentee_username: "",
    mentee_id: "",
    mentorship_token: "",
    duration
  };

  try {
    await createTimeSlot(timeSlot);
  } catch (error) {
    return makeErrorResponse(400, "-306", error);
  }

  return makeSuccessResponse(timeSlot, "103");
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
    return makeErrorResponse(400, "-307", error);
  }

  return makeSuccessResponse(timeSlotsData.Items);
};

export const getTimeSlotById: APIGatewayProxyHandler = async (event) => {
  const { pathParameters } = event;

  let timeSlotData: Awaited<ReturnType<typeof repositoryGetTimeSlotById>>;

  try {
    timeSlotData = await repositoryGetTimeSlotById(pathParameters?.id);
  } catch (error) {
    return makeErrorResponse(400, "-103", error);
  }

  if (!timeSlotData?.Item) {
    return makeErrorResponse(404, "-308");
  }

  return makeSuccessResponse(timeSlotData.Item);
};

export const updateTimeSlotState: APIGatewayProxyHandler = async (event) => {
  const { pathParameters } = event;
  const id = pathParameters.id;

  if (!id) {
    return makeErrorResponse(400, "-311");
  }

  const { is_occupied } = JSON.parse(event.body);

  let timeSlot: TimeSlot;

  try {
    let timeSlotData: Awaited<ReturnType<typeof fillTimeSlot>>;

    if (is_occupied) {
      timeSlotData = await fillTimeSlot(id);
    } else {
      timeSlotData = await freeTimeSlot(id);
    }

    timeSlot = timeSlotData.Attributes;
  } catch (err) {
    return makeErrorResponse(400, "-309", err);
  }

  return makeSuccessResponse(timeSlot, "104");
};

export const addMenteeToTimeSlot: APIGatewayProxyHandler = async (event) => {
  const { pathParameters } = event;
  const id = pathParameters.id;

  if (!id) {
    return makeErrorResponse(400, "-311");
  }

  const { mentee_username, mentee_id, mentorship_token } = JSON.parse(
    event.body
  );

  if (!mentee_username || !mentee_id || !mentorship_token) {
    return makeErrorResponse(400, "-311");
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
    return makeErrorResponse(400, "-309", err);
  }

  return makeSuccessResponse(timeSlot, "104");
};

export const deleteTimeSlot: APIGatewayProxyHandler = async (event) => {
  if (!event.pathParameters.id) {
    return makeErrorResponse(400, "-310");
  }

  let deletedTimeSlot: TimeSlot | undefined;

  try {
    const deletedResponseData = await repositoryDeleteTimeSlot(
      event.pathParameters.id
    );

    deletedTimeSlot = deletedResponseData.Attributes;
  } catch (err) {
    return makeErrorResponse(400, "-313", err);
  }

  if (deletedTimeSlot === undefined) {
    return makeErrorResponse(400, "-314");
  }

  return makeSuccessResponse(deletedTimeSlot, "105");
};
