import { Callback, Context } from "aws-lambda";
import { MENTOR_STATUS, TABLE_NAME_USER } from "../constants";
import { throwResponse } from "../utils/throwResponse";

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
    about_me,
    email,
    url_photo,
    role,
    links,
    skills,
  } = JSON.parse(event.body);

  if (!discord_id || typeof discord_id !== "string") {
    responseMessage = "Bad Request: discord_id is required or is not a string.";
    return throwResponse(callback, responseMessage, 400);
  }

  const user = {
    id: discord_id,
    discord_username,
    full_name,
    about_me,
    email,
    url_photo,
    role,
    links,
    skills,
    isActive: false,
    status: MENTOR_STATUS.DEACTIVE,
    timezone: 25,
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
      "id, discord_username, full_name, about_me, email, url_photo, #role, links, skills, isActive",
  };

  dynamoDb.scan(params, (err, data) => {
    if (err) {
      responseMessage = `Unable to get all Users. Error: ${err}`;
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
  const data = JSON.parse(event.body);

  const generateUpdateQuery = (fields) => {
    const allowedFieldsToUpdate = [
      "discord_username",
      "full_name",
      "about_me",
      "email",
      "url_photo",
      "role",
      "links",
      "skills",
      "timezone",
    ];

    let expression = {
      UpdateExpression: "set",
      ExpressionAttributeNames: {},
      ExpressionAttributeValues: {},
    };

    Object.entries(fields).forEach(([key, item]) => {
      if (allowedFieldsToUpdate.includes(key)) {
        expression.UpdateExpression += ` #${key} = :${key},`;
        expression.ExpressionAttributeNames[`#${key}`] = key;
        expression.ExpressionAttributeValues[`:${key}`] = item;
      }
    });

    expression.UpdateExpression = expression.UpdateExpression.slice(0, -1);

    if (Object.keys(expression.ExpressionAttributeNames).length === 0) {
      responseMessage = "Bad Request: no valid fields to update.";
      return throwResponse(callback, responseMessage, 400);
    } else return expression;
  };

  let updateExpression = generateUpdateQuery(data);

  const params = {
    TableName: TABLE_NAME_USER,
    Key: { id: event.pathParameters.id },
    ConditionExpression: "attribute_exists(id)",
    ReturnValues: "ALL_NEW",
    ...updateExpression,
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
  const { isActive, byWho } = JSON.parse(event.body);

  const check = Object.values(MENTOR_STATUS).find((st) => st === isActive);

  if (!isActive || check.length <= 0) {
    responseMessage =
      "Bad Request: isActive property is missing or is not allowable option.";
    return throwResponse(callback, responseMessage, 400);
  }

  const params = {
    TableName: TABLE_NAME_USER,
    Key: {
      id: event.pathParameters.id,
    },
    ExpressionAttributeValues: {
      ":isActive": isActive,
      ":byWho": byWho,
    },
    ConditionExpression: "attribute_exists(id)",
    UpdateExpression: "SET isActive = :isActive, byWho = :byWho",
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
