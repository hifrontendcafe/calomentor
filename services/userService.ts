import type { APIGatewayProxyHandler } from "aws-lambda";

import { Callback, Context } from "aws-lambda";
import type { AWSError } from "aws-sdk";
import { TABLE_NAME_USER } from "../constants";
import {
  createUser,
  getUsers,
  getUserById,
  deleteUserById,
  updateUser,
} from "../repository/user";
import type { User } from "../types";
import { generateUpdateQuery } from "../utils/dynamoDb";
import { makeErrorResponse, makeSuccessResponse } from "../utils/makeResponses";
import { throwResponse } from "../utils/throwResponse";

const AWS = require("aws-sdk"); // eslint-disable-line import/no-extraneous-dependencies

const dynamoDb = new AWS.DynamoDB.DocumentClient();
let responseMessage = "";

function isAWSError(error: any): error is AWSError {
  return error?.code;
}

export const createUserService: APIGatewayProxyHandler = async (event) => {
  const {
    id,
    discord_username,
    full_name,
    about_me,
    email,
    url_photo,
    role,
    links,
    skills,
  } = JSON.parse(event.body);

  if (!id || typeof id !== "string") {
    return makeErrorResponse(400, "-315");
  }

  const user: User = {
    id,
    discord_username,
    full_name,
    about_me,
    email,
    url_photo,
    role,
    links,
    skills,
    isActive: false,
    lastActivateBy: "",
    timezone: "25",
  };

  try {
    await createUser(user);
  } catch (error: unknown) {
    if (isAWSError(error)) {
      if (error?.code === "ConditionalCheckFailedException") {
        return makeErrorResponse(400, "-200", error);
      }
    }

    return makeErrorResponse(400, "-201", error);
  }

  return makeSuccessResponse(user);
};

export const getUsersService: APIGatewayProxyHandler = async () => {
  let mentors: User[];

  try {
    const mentorsData = await getUsers({ role: "mentor" });
    mentors = mentorsData.Items;
  } catch (error) {
    return makeErrorResponse(400, "-203", error);
  }

  if (mentors.length === 0) {
    return makeErrorResponse(404, "-202");
  }

  return makeSuccessResponse(mentors);
};

export const getUserByIdService: APIGatewayProxyHandler = async (event) => {
  const id = event?.pathParameters?.id;

  if (!id) {
    return makeErrorResponse(400, "-311");
  }

  let user: User;
  try {
    const userData = await getUserById(event.pathParameters.id);
    user = userData.Item;
  } catch (error) {
    return makeErrorResponse(400, "-205", error);
  }

  if (!user) {
    return makeErrorResponse(404, "-204");
  }

  return makeSuccessResponse(user);
};

export const deleteUserByIdService: APIGatewayProxyHandler = async (event) => {
  const id = event?.pathParameters?.id;

  if (!id) {
    return makeErrorResponse(400, "-311");
  }

  let user: User;
  try {
    const userData = await deleteUserById(event.pathParameters.id);
    user = userData.Attributes;
  } catch (error) {
    return makeErrorResponse(500, "-316", error);
  }

  if (!user) {
    return makeErrorResponse(404, "-204");
  }

  return makeSuccessResponse(user, "202");
};

export const updateUserByIdService: APIGatewayProxyHandler = async (event) => {
  const id = event?.pathParameters?.id;

  if (!id) {
    return makeErrorResponse(400, "-311");
  }

  const data = JSON.parse(event.body);

  let result: Awaited<ReturnType<typeof updateUser>>;
  try {
    result = await updateUser(id, data);
  } catch (err) {
    return makeErrorResponse(400, "-317", err);
  }

  const error = result.$response.error;
  const user: User = result.Attributes;
  if (error || !user) {
    if ((error as AWSError)?.code === "ConditionalCheckFailedException") {
      return makeErrorResponse(400, "-318", error);
    }

    return makeErrorResponse(400, "-317", error);
  }

  return makeSuccessResponse(user, "203");
};

export const activateUserService = (
  event: any,
  context: Context,
  callback: Callback<any>
): void => {
  const { isActive, lastActivateBy } = JSON.parse(event.body);

  if (typeof isActive !== "boolean" && lastActivateBy) {
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
      ":lastActivateBy": lastActivateBy,
    },
    ConditionExpression: "attribute_exists(id)",
    UpdateExpression:
      "SET isActive = :isActive, lastActivateBy = :lastActivateBy",
    ReturnValues: "ALL_NEW",
  };

  dynamoDb.update(params, (error, data) => {
    if (error) {
      if (error.code === "ConditionalCheckFailedException") {
        responseMessage = `Unable to activate user. Id ${event.pathParameters.id} not found`;
        throwResponse(callback, responseMessage, 404);
      }
      (responseMessage = `Unable to activate user. Error: ${error}`),
        throwResponse(callback, responseMessage, 400);
    } else {
      responseMessage = `User with id ${event.pathParameters.id} activated succesfully.`;
      throwResponse(callback, responseMessage, 200, data.Attributes);
    }
  });
};
