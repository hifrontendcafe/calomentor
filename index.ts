import { Handler, Context, Callback } from "aws-lambda";

export {
  getTimeSlotsByUser,
  getTimeSlotById,
  addTimeSlot,
  updateTimeSlotState,
  deleteTimeSlot,
  addMenteeToTimeSlot,
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
  confirmationMentorship,
  sendFeedbackFormMentorship,
} from "./services/mentorshipService";

import {
  addWarningService,
  forgiveWarning,
  getAllWarnings,
  getWarnings,
} from "./services/warningsService";

import { getMentorships } from "./services/mentorship";

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

export const mentorshipFeedbackSend: Handler = (
  event: any,
  context: Context,
  callback: Callback<any>
) => sendFeedbackFormMentorship(event, context, callback);

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

// Warnings functions handlers

export const addWarningMentorship: Handler = (
  event: any,
  context: Context,
  callback: Callback<any>
) => addWarningService(event, context, callback);

export const getWarningsMentorship: Handler = (
  event: any,
  context: Context,
  callback: Callback<any>
) => getAllWarnings(event, context, callback);

export const getWarningsMentorshipByMentee: Handler = (
  event: any,
  context: Context,
  callback: Callback<any>
) => getWarnings(event, context, callback);

export const forgiveWarningMentorship: Handler = (
  event: any,
  context: Context,
  callback: Callback<any>
) => forgiveWarning(event, context, callback);
