import { Handler, Context, Callback } from "aws-lambda";
import { testService } from "./services/testService";
import { createUserService, activateMentorService, getUsersService, getUserByIdService, deleteUserByIdService, updateUserByIdService } from "./services/userService";
import { mentorshipService } from "./services/mentorshipService";

export const test: Handler = async (
  event: any,
  context: Context,
  callback: any
) => await testService(event, context, callback);

export const activateMentor: Handler = (
  event: any,
  context: Context,
  callback: Callback<any>
) => activateMentorService(event, context, callback);

export const createUser: Handler = (
  event: any,
  context: Context,
  callback: Callback<any>
) => createUserService(event, context, callback);

export const getUsers: Handler = (
  event: any,
  context: Context,
  callback: Callback<any>
) => getUsersService(event, context, callback);

export const getUserById: Handler = (
  event: any,
  context: Context,
  callback: Callback<any>
) => getUserByIdService(event, context, callback);

export const deleteUserById: Handler = (
  event: any,
  context: Context,
  callback: Callback<any>
) => deleteUserByIdService(event, context, callback);

export const updateUserById: Handler = (
  event: any,
  context: Context,
  callback: Callback<any>
) => updateUserByIdService(event, context, callback);

export const mentorshipConfirmation: Handler = (
  event: any,
  context: Context,
  callback: Callback<any>
) => mentorshipService(event, context, callback);
