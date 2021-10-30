import { Handler, Context, Callback } from "aws-lambda";
import {
  addTimeSlots,
  updateTimeSlot,
  getTimeSlotsByUserId,
  deleteTimeSlot,
  getTimeSlotsById,
  updateMenteeToTimeSlot,
} from "./services/timeSlots";
import {
  createUserService,
  activateUserService,
  getUsersService,
  getUserByIdService,
  deleteUserByIdService,
  updateUserByIdService,
} from "./services/userService";
import {
  cancelMentorship,
  createMentorship,
  feedbackFormMentorship,
  reminderMentorship,
  updateRoleMentorship,
  checkCancelFunction,
  getMentorships,
  confirmationMentorship,
} from "./services/mentorshipService";

// User functions handlers

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

// Mentorships functions handlers

export const mentorshipCreate: Handler = (
  event: any,
  context: Context,
  callback: Callback<any>
) => createMentorship(event, context, callback);

export const mentorshipCancel: Handler = (
  event: any,
  context: Context,
  callback: Callback<any>
) => cancelMentorship(event, context, callback);

export const checkCancel: Handler = (
  event: any,
  context: Context,
  callback: Callback<any>
) => checkCancelFunction(event, context, callback);

export const mentorshipReminder: Handler = (
  event: any,
  context: Context,
  callback: Callback<any>
) => reminderMentorship(event, context, callback);

export const mentorshipUpdateRole: Handler = (
  event: any,
  context: Context,
  callback: Callback<any>
) => updateRoleMentorship(event, context, callback);

export const mentorshipFeedbackForm: Handler = (
  event: any,
  context: Context,
  callback: Callback<any>
) => feedbackFormMentorship(event, context, callback);

export const mentorshipConfirmation: Handler = (
  event: any,
  context: Context,
  callback: Callback<any>
) => confirmationMentorship(event, context, callback);

export const getAllMentorships: Handler = (
  event: any,
  context: Context,
  callback: Callback<any>
) => getMentorships(event, context, callback);

// Time slots functions handlers

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

export const getTimeSlot: Handler = (
  event: any,
  context: Context,
  callback: Callback<any>
) => getTimeSlotsById(event, context, callback);

export const updateSlot: Handler = (
  event: any,
  context: Context,
  callback: Callback<any>
) => updateTimeSlot(event, context, callback);

export const updateMenteeSlot: Handler = (
  event: any,
  context: Context,
  callback: Callback<any>
) => updateMenteeToTimeSlot(event, context, callback);

export const deleteSlot: Handler = (
  event: any,
  context: Context,
  callback: Callback<any>
) => deleteTimeSlot(event, context, callback);
