import { Callback, Context } from "aws-lambda";
import { TABLE_NAME_TIME_SLOT } from "../constants";
import { v4 as uuidv4 } from "uuid";
import { throwResponse } from "../utils/throwResponse";
import { makeErrorResponse, makeSuccessResponse } from "../utils/makeResponses";
import { TimeSlot } from "../types";
import {
  createTimeSlot,
  getTimeSlotsByUserId,
  getTimeSlotById,
  fillTimeSlot,
  freeTimeSlot
} from "../repository/timeSlot";

const AWS = require("aws-sdk"); // eslint-disable-line import/no-extraneous-dependencies

const dynamoDb = new AWS.DynamoDB.DocumentClient();

export const addTimeSlot = async (event: any) => {
  const { user_id, slot_date } = JSON.parse(event.body);

  if (!user_id && !slot_date) {
    return makeErrorResponse(400, "-113");
  }

  const date = new Date(slot_date);

  const timeSlot: TimeSlot = {
    id: uuidv4(),
    user_id,
    date: date.getTime(),
    is_occupied: false,
    mentee_username: "",
    mentee_id: "",
    tokenForCancel: "",
  };

  try {
    await createTimeSlot(timeSlot);
  } catch (error) {
    return makeErrorResponse(400, "-306", error);
  }

  return makeSuccessResponse(timeSlot, "103");
};

export const getTimeSlots = async (event: any) => {
  const { queryStringParameters, pathParameters } = event;

  let timeSlotsData: Awaited<ReturnType<typeof getTimeSlotsByUserId>>;

  try {
    timeSlotsData = await getTimeSlotsByUserId(pathParameters.id, {
      slotDate: queryStringParameters?.slot_date,
      onlyFree: queryStringParameters?.only_free,
    });
  } catch (error) {
    return makeErrorResponse(400, "-307", error);
  }

  return makeSuccessResponse(timeSlotsData.Items);
};

export const getTimeSlotsById = async (event: any) => {
  const { pathParameters } = event;

  let timeSlotData: Awaited<ReturnType<typeof getTimeSlotById>>;

  try {
    timeSlotData = await getTimeSlotById(pathParameters?.id);
  } catch (error) {
    return makeErrorResponse(400, "-103", error);
  }

  if (!timeSlotData?.Item) {
    return makeErrorResponse(404, "-308");
  }

  return makeSuccessResponse(timeSlotData.Item);
};

export const updateTimeSlotState = async (event: any) => {
  const { pathParameters } = event;
  const id = pathParameters.id;

  const { is_occupied } = JSON.parse(event.body);

  if (!id) {
    return makeErrorResponse(400, "-310");
  }

  let timeSlotData: Awaited<ReturnType<typeof fillTimeSlot>>;
  let timeSlot: TimeSlot;

  try {
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

export const updateMenteeToTimeSlot = (
  event: any,
  context: Context,
  callback: Callback<any>
): void => {
  const { id, mentee_username, mentee_id, tokenForCancel } = JSON.parse(
    event.body
  );

  if (!id) {
    const errorMessage = `Bad Request: id are required`;
    return throwResponse(callback, errorMessage, 400);
  }

  const params = {
    TableName: TABLE_NAME_TIME_SLOT,
    Key: {
      id: id,
    },
    ExpressionAttributeValues: {
      ":mentee_id": mentee_id,
      ":mentee_username": mentee_username,
      ":tokenForCancel": tokenForCancel,
    },
    UpdateExpression:
      "SET mentee_id = :mentee_id, mentee_username = :mentee_username, tokenForCancel = :tokenForCancel",
    ReturnValues: "ALL_NEW",
  };

  dynamoDb.update(params, (err, result) => {
    if (err) {
      return throwResponse(
        callback,
        `There Was an error trying to update the slot`,
        400
      );
    } else {
      return throwResponse(
        callback,
        `The slot was succesfully updated`,
        200,
        result.Attributes
      );
    }
  });
};

export const deleteTimeSlot = (
  event: any,
  context: Context,
  callback: Callback<any>
): void => {
  if (!event.pathParameters.id) {
    const errorMessage = `Bad Request: id y slots are required`;
    return throwResponse(callback, errorMessage, 400);
  }

  const params = {
    TableName: TABLE_NAME_TIME_SLOT,
    Key: {
      id: event.pathParameters.id,
    },
    ReturnValues: "ALL_OLD",
  };

  dynamoDb.delete(params, (err, result) => {
    if (err || !result.Attributes) {
      return throwResponse(
        callback,
        `There Was an error trying to delete the slot or the slot doesn't exist`,
        400
      );
    } else {
      return throwResponse(
        callback,
        `The slot was succesfully deleted`,
        200,
        result.Attributes
      );
    }
  });
};
