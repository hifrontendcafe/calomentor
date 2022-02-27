import type { APIGatewayProxyHandler } from "aws-lambda";
import { v4 as uuidv4 } from "uuid";
import {
  activateUser,
  addTokenToUser,
  createUser,
  deactivateUser,
  deleteUserById,
  getUserById,
  getUserByToken,
  getUsers,
  updateUser,
} from "../repository/user";
import type { User } from "../types";
import { isAWSError } from "../utils/dynamoDb";
import { makeErrorResponse, makeSuccessResponse } from "../utils/makeResponses";
import { isAdmin, isUserRoleUpdated } from "../utils/validations";

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
    timezone,
  } = JSON.parse(event.body);

  if (!id || typeof id !== "string") {
    return makeErrorResponse(400, "-211");
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
    is_active: false,
    last_activated_by: "",
    user_timezone: timezone,
    user_token: uuidv4(),
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
    return makeErrorResponse(400, "-212");
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
    return makeErrorResponse(400, "-212");
  }

  let user: User;
  try {
    const userData = await deleteUserById(event.pathParameters.id);
    user = userData.Attributes;
  } catch (error) {
    return makeErrorResponse(500, "-206", error);
  }

  if (!user) {
    return makeErrorResponse(404, "-204");
  }

  return makeSuccessResponse(user, "202");
};

export const updateUserByIdService: APIGatewayProxyHandler = async (event) => {
  const id = event?.pathParameters?.id;

  if (!id) {
    return makeErrorResponse(400, "-212");
  }

  const data = JSON.parse(event.body);

  try {
    const isRoleUpdated = await isUserRoleUpdated(id, data.role);
    if (isRoleUpdated) {
      const user_token = uuidv4();
      await addTokenToUser(id, user_token);
    }
  } catch (error) {
    return makeErrorResponse(400, "-210", error);
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
      "user_timezone",
    ]);
  } catch (err) {
    return makeErrorResponse(400, "-207", err);
  }

  const error = result.$response.error;
  const user: User = result.Attributes;
  if (error || !user) {
    if (isConditionalCheckFailedError(error)) {
      return makeErrorResponse(400, "-208", error);
    }

    return makeErrorResponse(400, "-207", error);
  }

  return makeSuccessResponse(user, "203");
};

export const activateUserService: APIGatewayProxyHandler = async (event) => {
  // const user_token = event.headers["user-token"];
  // if (!user_token || (await getUserByToken(user_token)).Count === 0) {
  //   return makeErrorResponse(401, "-117");
  // }
  // if (!(await isAdmin(user_token))) {
  //   return makeErrorResponse(403, "-116");
  // }
  const id = event?.pathParameters?.id;

  if (!id) {
    return makeErrorResponse(400, "-212");
  }

  const { is_active, last_activated_by } = JSON.parse(event.body);

  if (typeof is_active !== "boolean" || !last_activated_by) {
    return makeErrorResponse(400, "-209");
  }

  let result: Awaited<ReturnType<typeof updateUser>>;
  try {
    if (is_active) {
      result = await activateUser(id, last_activated_by);
    } else {
      result = await deactivateUser(id, last_activated_by);
    }
  } catch (error) {
    return makeErrorResponse(400, "-207", error);
  }

  const error = result.$response.error;
  const user: User = result.Attributes;
  if (error || !user) {
    if (isConditionalCheckFailedError(error)) {
      return makeErrorResponse(400, "-208", error);
    }

    return makeErrorResponse(400, "-207", error);
  }

  return makeSuccessResponse(user, "203");
};
