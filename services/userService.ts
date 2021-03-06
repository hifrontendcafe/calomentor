import type { APIGatewayProxyHandler } from "aws-lambda";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { v4 as uuidv4 } from "uuid";
import { USER_STATUS } from "../constants";
import {
  activateUser,
  addTokenToUser,
  createUser,
  deactivateUser,
  deleteUserById,
  deleteUserFromMentorship,
  getMentors,
  getUserById,
  getUserByToken,
  getUsers,
  updateUser,
} from "../repository/user";
import type { Mentor, User } from "../types";
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
    accepted_coc: false,
    user_status: USER_STATUS.OUT,
    modified_by: "",
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

export const getUsersService: APIGatewayProxyHandler = async (event) => {
  const { queryStringParameters } = event;
  let mentors: User[];
  let count: number;
  let lastKey: DocumentClient.Key;

  try {
    const mentorsData = await getUsers(
      {
        role: "mentor",
        onlyInTheProgram: queryStringParameters?.only_in_the_program === "true",
      },
      queryStringParameters?.last_key,
      queryStringParameters?.limit
    );
    mentors = mentorsData.Items;
    count = mentorsData.Count;
    lastKey = mentorsData.LastEvaluatedKey;
  } catch (error) {
    return makeErrorResponse(400, "-203", error);
  }

  if (mentors.length === 0) {
    return makeErrorResponse(404, "-202");
  }

  return makeSuccessResponse(mentors, "1", count, lastKey);
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
      "accepted_coc",
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

  const { user_status, modified_by } = JSON.parse(event.body);

  if (!user_status || !modified_by) {
    return makeErrorResponse(400, "-209");
  }

  let result: Awaited<ReturnType<typeof updateUser>>;
  try {
    if (user_status === USER_STATUS.OUT) {
      result = await deleteUserFromMentorship(id, modified_by);
    } else if (user_status === USER_STATUS.ACTIVE) {
      result = await activateUser(id, modified_by);
    } else {
      result = await deactivateUser(id, modified_by);
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

export const getMentorsFromSanity: APIGatewayProxyHandler = async (event) => {
  try {
    const mentors: Awaited<Mentor[]> = await getMentors()
    return makeSuccessResponse(mentors, "201");
  } catch (error) {
    return makeErrorResponse(400, "-207", error);
  }
};
