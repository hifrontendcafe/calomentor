import { Callback, Context } from "aws-lambda";
import { TABLE_NAME_USER, TABLE_NAME_TIME_SLOT } from "../constants";
import { GlobalResponse } from "../types/globalTypes";
import { v5 as uuidv5 } from "uuid";
import { throwResponse } from "../utils/throwResponse";
import { createAndUpdateUserValidations } from "../utils/validations";

const AWS = require("aws-sdk"); // eslint-disable-line import/no-extraneous-dependencies

const dynamoDb = new AWS.DynamoDB.DocumentClient();
let responseMessage = "";

export const createUserService = (
  event: any,
  context: Context,
  callback: Callback<any>
): void => {
  const {
    discord_id,
    discord_username,
    full_name,
    email,
    url_photo,
    role,
    links,
    skills,
  } = JSON.parse(event.body);

  if (!discord_id || typeof discord_id !== "string") {
    responseMessage = "Bad Request: discord_id is required.";
    throwResponse(callback, responseMessage, 400);
  }

  createAndUpdateUserValidations(
    callback,
    discord_username,
    full_name,
    email,
    url_photo,
    role,
    links,
    skills
  );

  const user = {
    id: discord_id,
    discord_username,
    full_name,
    email,
    url_photo,
    role,
    links,
    skills,
    isActive: false,
  };

  const params = {
    TableName: TABLE_NAME_USER,
    Item: user,
    ConditionExpression: "attribute_not_exists(id)",
  };

  dynamoDb.put(params, (error, data) => {
    if (error) {
      if (error.code === "ConditionalCheckFailedException") {
        responseMessage = `Unable to create user. Id ${discord_id} already exists.`;
        throwResponse(callback, responseMessage, 400);
      }
      responseMessage = `Unable to create user. Error: ${error}`;
      throwResponse(callback, responseMessage, 500);
    } else {
      responseMessage = `User created succesfully`;
      throwResponse(callback, responseMessage, 200);
    }
  });
};

export const getUsersService = (
  event: any,
  context: Context,
  callback: Callback<any>
): void => {
  const params = {
    TableName: TABLE_NAME_USER,
    ExpressionAttributeNames: {
      "#role": "role",
    },
    ProjectionExpression:
      "id, discord_username, full_name, email, url_photo, #role, links, skills, isActive",
  };

  dynamoDb.scan(params, (err, data) => {
    if (err) {
      const responseMessage = `Unable to get all Users. Error: ${err}`;
      throwResponse(callback, responseMessage, 500);
    } else {
      throwResponse(callback, "", 200, data.Items);
    }
  });
};

export const getUserByIdService = (
  event: any,
  context: Context,
  callback: Callback<any>
): void => {
  const params = {
    TableName: TABLE_NAME_USER,
    Key: { id: event.pathParameters.id },
  };

  dynamoDb.get(params, (err, data) => {
    if (err) {
      responseMessage = `Unable to get user by id. Error: ${err}`;
      throwResponse(callback, responseMessage, 500);
    } else {
      if (Object.keys(data).length === 0) {
        responseMessage = `User with id ${event.pathParameters.id} not found`;
        throwResponse(callback, responseMessage, 404);
      } else {
        throwResponse(callback, "", 200, data.Item);
      }
    }
  });
};

export const deleteUserByIdService = (
  event: any,
  context: Context,
  callback: Callback<any>
): void => {
  const params = {
    TableName: TABLE_NAME_USER,
    ProjectionExpression: "discord_id, discord_username, full_name",
    Key: { id: event.pathParameters.id },
    ReturnValues: "ALL_OLD",
  };

  dynamoDb.delete(params, (err, data) => {
    if (err) {
      responseMessage = `Unable to delete user. Error: ${err}`;
      throwResponse(callback, responseMessage, 500);
    } else {
      if (Object.keys(data).length === 0) {
        responseMessage = `Unable to delete user. Id ${event.pathParameters.id} not found`;
        throwResponse(callback, responseMessage, 404);
      } else {
        responseMessage = "User deleted succesfully";
        throwResponse(callback, responseMessage, 200);
      }
    }
  });
};

export const updateUserByIdService = (
  event: any,
  context: Context,
  callback: Callback<any>
): void => {
  const { discord_username, full_name, email, url_photo, role, links, skills } =
    JSON.parse(event.body);

  createAndUpdateUserValidations(
    callback,
    discord_username,
    full_name,
    email,
    url_photo,
    role,
    links,
    skills
  );

  const params = {
    TableName: TABLE_NAME_USER,
    Key: { id: event.pathParameters.id },
    ExpressionAttributeNames: {
      "#role": "role",
    },
    ExpressionAttributeValues: {
      ":discord_username": discord_username,
      ":full_name": full_name,
      ":email": email,
      ":role": role,
      ":url_photo": url_photo,
      ":skills": skills,
      ":links": links,
    },
    ConditionExpression: "attribute_exists(id)",
    UpdateExpression:
      "SET discord_username = :discord_username, full_name = :full_name, email = :email, #role = :role, url_photo = :url_photo, skills = :skills, links = :links",
    ReturnValues: "ALL_NEW",
  };

  dynamoDb.update(params, (error, data) => {
    if (error) {
      if (error.code === "ConditionalCheckFailedException") {
        responseMessage = `Unable to update user. Id ${event.pathParameters.id} not found`;
        throwResponse(callback, responseMessage, 404);
      }
      responseMessage = `Unable to update user. Error: ${error}`;
      throwResponse(callback, responseMessage, 500);
    } else {
      responseMessage = `User with id ${event.pathParameters.id} updated succesfully.`;
      throwResponse(callback, responseMessage, 200, data.Attributes);
    }
  });
};

export const activateUserService = (
  event: any,
  context: Context,
  callback: Callback<any>
): void => {
  const { isActive } = JSON.parse(event.body);

  if (!isActive || typeof isActive !== "boolean") {
    responseMessage =
      "Bad Request: isActive property is missing or it's not boolean.";
    throwResponse(callback, responseMessage, 400);
  }

  const params = {
    TableName: TABLE_NAME_USER,
    Key: {
      id: event.pathParameters.id,
    },
    ExpressionAttributeValues: {
      ":isActive": isActive,
    },
    ConditionExpression: "attribute_exists(id)",
    UpdateExpression: "SET isActive = :isActive",
    ReturnValues: "ALL_NEW",
  };

  dynamoDb.update(params, (error, data) => {
    if (error) {
      if (error.code === "ConditionalCheckFailedException") {
        responseMessage = `Unable to activate user. Id ${event.pathParameters.id} not found`;
        throwResponse(callback, responseMessage, 404);
      }
      (responseMessage = `Unable to activate user. Error: ${error}`),
        throwResponse(callback, responseMessage, 500);
    } else {
      responseMessage = `User with id ${event.pathParameters.id} activated succesfully.`;
      throwResponse(callback, responseMessage, 200, data.Attributes);
    }
  });
};

export const addTimeSlots = (
  event: any,
  context: Context,
  callback: Callback<any>
): void => {
  const { id_mentor, date, slots } = JSON.parse(event.body);

  if (!id_mentor && !date && !slots) {
    const errorMessage = `Bad Request: id_mentor, date y slots are required`;
    return throwError(event, context, callback, errorMessage, 400);
  }

  if (slots.length > 0) {
    const errorMessage = `Bad Request: You must add at least one element in slots.`;
    return throwError(event, context, callback, errorMessage, 400);
  }

  const timeSlot = {
    id: uuidv5(),
    id_mentor,
    date,
    slots,
  };

  const timeSlotInfo = {
    TableName: TABLE_NAME_TIME_SLOT,
    Item: timeSlot,
  };

  dynamoDb
    .put(timeSlotInfo)
    .promise()
    .then((res) => {
      callback(null, {
        statusCode: 200,
        body: JSON.stringify({
          message: `Time slot added`,
          userId: res.id,
        }),
      });
    })
    .catch((err) => {
      console.log(err);
      callback(null, {
        statusCode: 500,
        body: JSON.stringify({
          message: `Unable to add a time slor`,
          error: err,
        }),
      });
    });
};

export const getTimeSlotsByIdMentor = (
  event: any,
  context: Context,
  callback: Callback<any>
): void => {
  const params = {
    TableName: TABLE_NAME_TIME_SLOT,
    ProjectionExpression: "id_mentor",
  };

  const onScan = (err, data) => {
    if (err) {
      console.log(
        "Scan failed to load data. Error JSON:",
        JSON.stringify(err, null, 2)
      );
      callback(err);
    } else {
      console.log("Scan succeeded.");
      return callback(null, {
        statusCode: 200,
        body: JSON.stringify({
          users: data.Items,
        }),
      });
    }
  };
  dynamoDb.scan(params, onScan);
};

export const getTimeSlotsByDate = (
  event: any,
  context: Context,
  callback: Callback<any>
): void => {
  const params = {
    TableName: TABLE_NAME_TIME_SLOT,
    ProjectionExpression: "date",
  };

  const onScan = (err, data) => {
    if (err) {
      console.log(
        "Scan failed to load data. Error JSON:",
        JSON.stringify(err, null, 2)
      );
      callback(err);
    } else {
      console.log("Scan succeeded.");
      return callback(null, {
        statusCode: 200,
        body: JSON.stringify({
          users: data.Items,
        }),
      });
    }
  };
  dynamoDb.scan(params, onScan);
};

export const updateTimeSlotsByDate = async (
  event: any,
  context: Context,
  callback: Callback<any>
): Promise<void> => {
  const { id, slots } = JSON.parse(event.body);

  if (!id && !slots) {
    const errorMessage = `Bad Request: id y slots are required`;
    return throwError(event, context, callback, errorMessage, 400);
  }

  if (slots.length > 0) {
    const errorMessage = `Bad Request: You must add at least one element in slots.`;
    return throwError(event, context, callback, errorMessage, 400);
  }

  let slotsOld;

  await dynamoDb.scan(
    {
      TableName: TABLE_NAME_TIME_SLOT,
      ProjectionExpression: "id",
    },
    (err, data) => {
      if (err) {
        console.log(
          "Scan failed to load data update timeSlot. Error JSON:",
          JSON.stringify(err, null, 2)
        );
        callback(err);
      } else {
        console.log("Scan succeeded.");
        slotsOld = data.Items.slots;
      }
    }
  );

  const newSlots = [...new Set([...slotsOld, ...slots])];

  const params = {
    TableName: TABLE_NAME_TIME_SLOT,
    Key: {
      id: event.pathParameters.id,
    },
    ExpressionAttributeValues: {
      ":slots": newSlots,
    },
    UpdateExpression: "SET slots = :slots",
    ReturnValues: "ALL_NEW",
  };

  dynamoDb.update(params, (error, result) => {
    let response: GlobalResponse;
    if (error) {
      response = {
        statusCode: 400,
        body: JSON.stringify({
          code: 400,
          message: "error",
          data: error,
        }),
      };
    } else {
      response = {
        statusCode: 200,
        body: JSON.stringify({
          code: 200,
          message: "success",
          result: result.Attributes,
        }),
      };
    }
    callback(null, response);
  });
};
