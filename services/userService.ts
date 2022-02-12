import type { APIGatewayProxyHandler } from "aws-lambda";

import {
  createUser,
  getUsers,
  getUserById,
  deleteUserById,
  updateUser,
  activateUser,
  deactivateUser,
  addTokenToUser,
} from "../repository/user";
import type { User } from "../types";
import { isAWSError } from "../utils/dynamoDb";
import { makeErrorResponse, makeSuccessResponse } from "../utils/makeResponses";
import { isUserRoleUpdated } from "../utils/validations";
import { v4 as uuidv4 } from "uuid";

function isConditionalCheckFailedError(error: any) {
  return isAWSError(error) && error?.code === "ConditionalCheckFailedException";
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
    timezone
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
    timezone,
    userToken: uuidv4()
  };

  try {
    await createUser(user);
  } catch (error: unknown) {
    if (isConditionalCheckFailedError(error)) {
      return makeErrorResponse(400, "-200", error);
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

  try {
    const isRoleUpdated = isUserRoleUpdated(id, data.role)
    if(isRoleUpdated) {
      const userToken = uuidv4()
      await addTokenToUser(id, userToken)
    }
  } catch (error) {
    return makeErrorResponse(400, "-320", error);
  }

  let result: Awaited<ReturnType<typeof updateUser>>;
  try {
    result = await updateUser(id, data, [
      "discord_username",
      "full_name",
      "about_me",
      "email",
      "url_photo",
      "role",
      "links",
      "skills",
      "timezone",
    ]);
  } catch (err) {
    return makeErrorResponse(400, "-317", err);
  }

  const error = result.$response.error;
  const user: User = result.Attributes;
  if (error || !user) {
    if (isConditionalCheckFailedError(error)) {
      return makeErrorResponse(400, "-318", error);
    }

    return makeErrorResponse(400, "-317", error);
  }

  return makeSuccessResponse(user, "203");
};

export const activateUserService: APIGatewayProxyHandler = async (event) => {
  const id = event?.pathParameters?.id;

  if (!id) {
    return makeErrorResponse(400, "-311");
  }

  const { isActive, lastActivateBy } = JSON.parse(event.body);

  if (typeof isActive !== "boolean" || !lastActivateBy) {
    return makeErrorResponse(400, "-319");
  }

  let result: Awaited<ReturnType<typeof updateUser>>;
  try {
    if (isActive) {
      result = await activateUser(id, lastActivateBy);
    } else {
      result = await deactivateUser(id, lastActivateBy);
    }
  } catch (error) {
    return makeErrorResponse(400, "-317", error);
  }

  const error = result.$response.error;
  const user: User = result.Attributes;
  if (error || !user) {
    if (isConditionalCheckFailedError(error)) {
      return makeErrorResponse(400, "-318", error);
    }

    return makeErrorResponse(400, "-317", error);
  }

  return makeSuccessResponse(user, "203");
};
