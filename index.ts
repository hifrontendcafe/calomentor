import { Handler, Context, Callback } from "aws-lambda";
import { mentorshipService } from "./services/mentorshipService";
import {
  addTimeSlots,
  updateTimeSlot,
  getTimeSlotsByUserId,
} from "./services/timeSlots";
import {
  createUserService,
  activateUserService,
  getUsersService,
  getUserByIdService,
  deleteUserByIdService,
  updateUserByIdService,
} from "./services/userService";

export const activateUser: Handler = (
  event: any,
  context: Context,
  callback: Callback<any>
) => activateUserService(event, context, callback);

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

export const addTimeSlot: Handler = (
  event: any,
  context: Context,
  callback: Callback<any>
) => addTimeSlots(event, context, callback);

export const getTimeSlotsByUser: Handler = (
  event: any,
  context: Context,
  callback: Callback<any>
) => getTimeSlotsByUserId(event, context, callback);

export const updateSlot: Handler = (
  event: any,
  context: Context,
  callback: Callback<any>
) => updateTimeSlot(event, context, callback);
