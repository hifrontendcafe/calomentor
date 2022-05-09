import { APIGatewayProxyHandler } from "aws-lambda";
import { Feedback } from "../types";
import { addFeedback, getFeedbackByMentorId } from "../repository/feedback";
import { makeErrorResponse, makeSuccessResponse } from "../utils/makeResponses";
import { v4 as uuidv4 } from "uuid";

export const addFeedbackService: APIGatewayProxyHandler = async (event) => {
  const {
    mentor_id,
    mentor_username_discord,
    mentor_name,
    mentee_id,
    mentee_username_discord,
    mentee_name,
    feedback_date,
    feedback_stars,
    feedback_mentee,
    feedback_mentee_private,
  } = JSON.parse(event.body);


  const newFeedback: Feedback = {
    id: uuidv4(),
    mentor_id,
    mentor_username_discord,
    mentor_name,
    mentee_id: mentee_id ?? null,
    mentee_username_discord: mentee_username_discord ?? null,
    mentee_name: mentee_name ?? null,
    feedback_date,
    feedback_stars,
    feedback_mentee,
    feedback_mentee_private: feedback_mentee_private ?? null,
  }

  try {
    await addFeedback(newFeedback)
  } catch (error) {
    return makeErrorResponse(400, "-500", error);
  }

  return makeSuccessResponse(newFeedback, "500");

};

export const getFeedbackService: APIGatewayProxyHandler = async (event) => {
  const { pathParameters } = event;

  let feedbackData: Awaited<ReturnType<typeof getFeedbackByMentorId>>;

  try {
    feedbackData = await getFeedbackByMentorId(pathParameters?.id);
  } catch (error) {
    return makeErrorResponse(400, "-501", error);
  }

  if (!feedbackData?.Items) {
    return makeErrorResponse(404, "-501");
  }

  return makeSuccessResponse(feedbackData.Items, "500");
};
