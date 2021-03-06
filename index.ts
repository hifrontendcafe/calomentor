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
  getMentorsFromSanity,
} from "./services/userService";

import {
  addWarningService,
  forgiveWarning,
  getAllWarnings,
  getWarnings,
  addWarningMatebotService,
  forgiveWarningByMentee,
  deleteWarningById,
} from "./services/warningsService";

import {
  getMentorships,
  confirmMentorship,
  cancelMentorship,
  feedbackMentorship,
  createMentorshipAPI,
  createMentorship,
  addRoleMentorship,
  reminderMentorship,
  feedbackFormMentorship,
  checkCancelMentorship,
  checkConfirmMentorship,
  confirmationAttemptMentorship,
  catchMentorship,
  createMentorshipMatebot,
  getMentorshipsByMentee,
  deleteMentorshipById,
} from "./services/mentorship";
import {
  addFeedbackService,
  getFeedbackService,
} from "./services/feedbackService";
import {
  getMentorshipsMetricsBetweenTwoDates,
  getMetrics,
  getWarningsMetricsBetweenTwoDates,
} from "./services/metrics";

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

export const getMentors: Handler = (
  event: any,
  context: Context,
  callback: Callback<any>
) => getMentorsFromSanity(event, context, callback);

// Mentorships functions handlers

export const mentorshipCreateAPI: Handler = (
  event: any,
  context: Context,
  callback: Callback<any>
) => createMentorshipAPI(event, context, callback);

export const mentorshipCreateMatebot: Handler = (
  event: any,
  context: Context,
  callback: Callback<any>
) => createMentorshipMatebot(event, context, callback);

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
) => checkCancelMentorship(event, context, callback);

export const mentorshipReminder: Handler = (
  event: any,
  context: Context,
  callback: Callback<any>
) => reminderMentorship(event, context, callback);

export const mentorshipAddRole: Handler = (
  event: any,
  context: Context,
  callback: Callback<any>
) => addRoleMentorship(event, context, callback);

export const mentorshipFeedbackForm: Handler = (
  event: any,
  context: Context,
  callback: Callback<any>
) => feedbackMentorship(event, context, callback);

export const mentorshipFeedbackSend: Handler = (
  event: any,
  context: Context,
  callback: Callback<any>
) => feedbackFormMentorship(event, context, callback);

export const mentorshipConfirmation: Handler = (
  event: any,
  context: Context,
  callback: Callback<any>
) => confirmMentorship(event, context, callback);

export const getAllMentorships: Handler = (
  event: any,
  context: Context,
  callback: Callback<any>
) => getMentorships(event, context, callback);

export const getMentorshipsByMenteeHandler: Handler = (
  event: any,
  context: Context,
  callback: Callback<any>
) => getMentorshipsByMentee(event, context, callback);

export const checkConfirmation: Handler = (
  event: any,
  context: Context,
  callback: Callback<any>
) => checkConfirmMentorship(event, context, callback);

export const confirmationAttempt: Handler = (
  event: any,
  context: Context,
  callback: Callback<any>
) => confirmationAttemptMentorship(event, context, callback);

export const mentorshipCatch: Handler = (
  event: any,
  context: Context,
  callback: Callback<any>
) => catchMentorship(event, context, callback);

export const mentorshipDelete: Handler = (
  event: any,
  context: Context,
  callback: Callback<any>
) => deleteMentorshipById(event, context, callback);

// Warnings functions handlers

export const addWarningMentorship: Handler = (
  event: any,
  context: Context,
  callback: Callback<any>
) => addWarningService(event, context, callback);

export const addWarningMatebotMentorship: Handler = (
  event: any,
  context: Context,
  callback: Callback<any>
) => addWarningMatebotService(event, context, callback);

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

export const forgiveWarningByMenteeHandler: Handler = (
  event: any,
  context: Context,
  callback: Callback<any>
) => forgiveWarningByMentee(event, context, callback);

export const warningDelete: Handler = (
  event: any,
  context: Context,
  callback: Callback<any>
) => deleteWarningById(event, context, callback);

// Feedback functions handlers

export const addFeedbackHandler: Handler = (
  event: any,
  context: Context,
  callback: Callback<any>
) => addFeedbackService(event, context, callback);

export const getFeedbackHandler: Handler = (
  event: any,
  context: Context,
  callback: Callback<any>
) => getFeedbackService(event, context, callback);
// Metrics functions handlers

export const getCalomentorMetrics: Handler = (
  event: any,
  context: Context,
  callback: Callback<any>
) => getMetrics(event, context, callback);

export const getMentorshipsBetweenTwoDates: Handler = (
  event: any,
  context: Context,
  callback: Callback<any>
) => getMentorshipsMetricsBetweenTwoDates(event, context, callback);

export const getWarningsBetweenTwoDates: Handler = (
  event: any,
  context: Context,
  callback: Callback<any>
) => getWarningsMetricsBetweenTwoDates(event, context, callback);
