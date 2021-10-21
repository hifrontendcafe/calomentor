import { Callback, Context } from "aws-lambda";
import { TABLE_NAME_TIME_SLOT } from "../constants";
import { v4 as uuidv4 } from "uuid";
import { throwResponse } from "../utils/throwResponse";

const AWS = require("aws-sdk"); // eslint-disable-line import/no-extraneous-dependencies

const dynamoDb = new AWS.DynamoDB.DocumentClient();

export const addTimeSlots = (
  event: any,
  context: Context,
  callback: Callback<any>
): void => {
  const { user_id, slot_date, slot_time } = JSON.parse(event.body);

  if (!user_id && !slot_date && !slot_time) {
    const errorMessage = `Bad Request: user_id, date y slots are required`;
    return throwResponse(callback, errorMessage, 400);
  }

  const timeSlot = {
    id: uuidv4(),
    user_id,
    slot_date,
    slot_time,
    is_occupied: false,
    is_cancelled: false,
    mentee_username: "",
    mentee_id: "",
    tokenForCancel: "",
  };

  const timeSlotInfo = {
    TableName: TABLE_NAME_TIME_SLOT,
    Item: timeSlot,
  };

  dynamoDb.put(timeSlotInfo, (err, result) => {
    if (err) {
      return throwResponse(callback, "Unable to add a Time Slot", 400);
    } else {
      return throwResponse(callback, "Time Slot added", 200);
    }
  });
};

export const getTimeSlotsByUserId = (
  event: any,
  context: Context,
  callback: Callback<any>
): void => {
  const paramsWithoutDate = {
    TableName: TABLE_NAME_TIME_SLOT,
    FilterExpression: "user_id = :user_id",
    ExpressionAttributeValues: {
      ":user_id": event.pathParameters.id,
    },
  };
  const paramsWithDate = {
    TableName: TABLE_NAME_TIME_SLOT,
    FilterExpression: "slot_date = :slot_date AND user_id = :user_id",
    ExpressionAttributeValues: {
      ":slot_date": event.queryStringParameters?.slot_date,
      ":user_id": event.pathParameters.id,
    },
  };
  dynamoDb.scan(
    event.queryStringParameters?.slot_date ? paramsWithDate : paramsWithoutDate,
    (error, data) => {
      let dataResponse = data.Items;
      if (error) {
        return throwResponse(callback, "Unable to get Time Slots", 400);
      } else if (data.Items.length < 1) {
        return throwResponse(callback, "Unable to get Time Slots", 400);
      }
      if (event.pathParameters.only_occupied) {
        dataResponse = dataResponse.filter((m) => !m.is_occupied);
      }
      return throwResponse(callback, "Success", 200, dataResponse);
    }
  );
};

export const getTimeSlotsById = (
  event: any,
  context: Context,
  callback: Callback<any>
): void => {
  let responseMessage = "";
  const params = {
    TableName: TABLE_NAME_TIME_SLOT,
    Key: { id: event.pathParameters.id },
  };

  dynamoDb.get(params, (err, data) => {
    if (err) {
      responseMessage = `Unable to get time slot by id. Error: ${err}`;
      throwResponse(callback, responseMessage, 500);
    } else {
      if (Object.keys(data).length === 0) {
        responseMessage = `Time Slot with id ${event.pathParameters.id} not found`;
        throwResponse(callback, responseMessage, 404);
      } else {
        throwResponse(callback, "", 200, data.Item);
      }
    }
  });
};

export const updateTimeSlot = (
  event: any,
  context: Context,
  callback: Callback<any>
): void => {
  const { id, is_occupied } = JSON.parse(event.body);

  if (!id) {
    const errorMessage = `Bad Request: id y slots are required`;
    return throwResponse(callback, errorMessage, 400);
  }

  const params = {
    TableName: TABLE_NAME_TIME_SLOT,
    Key: {
      id: id,
    },
    ExpressionAttributeValues: {
      ":is_occupied": is_occupied,
    },
    UpdateExpression: "SET is_occupied = :is_occupied",
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

export const updateMenteeToTimeSlot = (
  event: any,
  context: Context,
  callback: Callback<any>
): void => {
  const { id, mentee_username, mentee_id } = JSON.parse(event.body);

  if (!id) {
    const errorMessage = `Bad Request: id y slots are required`;
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
    },
    UpdateExpression:
      "SET mentee_id = :mentee_id AND mentee_username = :mentee_username ",
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
