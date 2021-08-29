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
  const { user_id, slot_date, slots } = JSON.parse(event.body);

  if (!user_id && !slot_date && !slots) {
    const errorMessage = `Bad Request: user_id, date y slots are required`;
    return throwResponse(callback, errorMessage, 400);
  }

  if (slots.length < 1) {
    const errorMessage = `Bad Request: You must add at least one element in slots.`;
    return throwResponse(callback, errorMessage, 400);
  }

  const timeSlot = {
    id: uuidv4(),
    user_id,
    slot_date,
    slots,
  };

  const timeSlotInfo = {
    TableName: TABLE_NAME_TIME_SLOT,
    Item: timeSlot,
  };

  let slot;

  const params = {
    TableName: TABLE_NAME_TIME_SLOT,
    FilterExpression: "slot_date = :slot_date AND user_id = :user_id",
    ExpressionAttributeValues: {
      ":slot_date": timeSlot.slot_date,
      ":user_id": timeSlot.user_id,
    },
  };
  dynamoDb.scan(params, (error, data) => {
    if (!error) {
      slot = data.Items;
    }
    if (slot.length > 0) {
      return throwResponse(
        callback,
        `Already have a time slot for day ${timeSlot.slot_date}`,
        400
      );
    }
    dynamoDb.put(timeSlotInfo, (err, result) => {
      if (err) {
        return throwResponse(callback, "Unable to add a Time Slot", 400);
      } else {
        return throwResponse(callback, "Time Slot added", 200);
      }
    });
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
      if (error) {
        return throwResponse(callback, "Unable to get Time Slots", 400);
      } else {
        return throwResponse(callback, "Success", 200, data.Items);
      }
    }
  );
};

export const updateTimeSlot = (
  event: any,
  context: Context,
  callback: Callback<any>
): void => {
  const { id, slot } = JSON.parse(event.body);

  if (!id && !slot) {
    const errorMessage = `Bad Request: id y slots are required`;
    return throwResponse(callback, errorMessage, 400);
  }

  let slots;

  const params = {
    TableName: TABLE_NAME_TIME_SLOT,
    Key: {
      id: id,
    },
  };

  dynamoDb.scan(params, (err, data) => {
    if (!err) {
      slots = data.Items;
    }

    if (!slots) {
      return throwResponse(
        callback,
        `Was an error trying to update the slot ${slots[0].slot_date} - ${slot.time}`,
        400
      );
    }

    slots[0].slots = slots[0].slots.map((s) => {
      if (s.time === slot.time) {
        return slot;
      }
      return s;
    });

    const params = {
      TableName: TABLE_NAME_TIME_SLOT,
      Key: {
        id: id,
      },
      ExpressionAttributeValues: {
        ":slots": slots[0].slots,
      },
      UpdateExpression: "SET slots = :slots",
      ReturnValues: "ALL_NEW",
    };

    dynamoDb.update(params, (err, result) => {
      if (err) {
        return throwResponse(
          callback,
          `Was an error trying to update the slot ${slots[0].slot_date} - ${slot.time}`,
          400
        );
      } else {
        console.log(result.Attributes);
        return throwResponse(
          callback,
          `The slot ${slots[0].slot_date} - ${slot.time} was succesfully updated`,
          200,
          result.Attributes
        );
      }
    });
  });
};
