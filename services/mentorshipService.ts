import { Callback, Context } from "aws-lambda";
import { TABLE_NAME_MENTORSHIP, TABLE_NAME_USER } from "../constants";
import { throwResponse } from "../utils/throwResponse";
import { createAndUpdateUserValidations } from "../utils/validations";

const AWS = require("aws-sdk"); // eslint-disable-line import/no-extraneous-dependencies

const dynamoDb = new AWS.DynamoDB.DocumentClient();
let responseMessage = "";

export const createMentorship = (
  event: any,
  context: Context,
  callback: Callback<any>
): void => {
  //TODO: Save mentorship
  //TODO: Send confirmation emails to mentor and mentee with information of the mentorhsip and link to cancel
  //TODO: Send confirmation discord dm to the mentor and mentee
};

export const cancelMentorship = (
  event: any,
  context: Context,
  callback: Callback<any>
): void => {
  //TODO: Cancel mentorship
  //TODO: Send cancel emails to mentor and mentee
  //TODO: Send cancel discord dm to the mentor and mentee
};

export const reminderMentorship = (
  event: any,
  context: Context,
  callback: Callback<any>
): void => {
  //TODO: Send reminder emails to mentor and mentee
  //TODO: Send reminder discord dm to the mentor and mentee
};

export const updateRoleMentorship = (
  event: any,
  context: Context,
  callback: Callback<any>
): void => {
  //TODO: Add or delete discord role to the mentee
};

export const feedbackFormMentorship = (
  event: any,
  context: Context,
  callback: Callback<any>
): void => {
  //TODO: Send feedback form mail to the mentee
};
