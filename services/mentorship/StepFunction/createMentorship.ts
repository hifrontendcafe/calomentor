import { Handler } from "aws-lambda";
import { RESPONSE_CODES } from "../../../constants";
import { MentorshipRequestBody, MentorshipResponse } from "../../../types";
import { addTime, substractTime } from "../../../utils/dates";
import { makeLambdaResponse } from "../../../utils/makeResponses";

const createMentorship: Handler<MentorshipRequestBody, MentorshipResponse> = (
  event,
  _,
  callback
) => {
  const {
    mentorId,
    menteeId,
    menteeName,
    menteeEmail,
    menteeTimezone,
    mentorTimezone,
    mentorName,
    mentorEmail,
    mentorshipDate,
    mentorshipId,
    mentorship_token,
    mentorship_duration
  } = event;

  const date = new Date(mentorshipDate);

  // Commented only for testing

  // const dateToRemindConfirmationAttemptOne = substractTime(date, 3, "days");
  // const dateToRemindConfirmationAttemptTwo = substractTime(date, 2, "days");
  // const dateToRemindAttemptOne = substractTime(date, 1, "day");
  // const dateToRemindAttemptTwo = substractTime(date, 1, "hour");
  // const dateToRemindAttemptThree = substractTime(date, 10, "minutes");
  // const dateToSendFeedback = addTime(date, 1, "hours");

  const dateToRemindConfirmationAttemptOne = substractTime(date, 10, "minutes");
  const dateToRemindConfirmationAttemptTwo = substractTime(date, 8, "minutes");
  const dateToRemindAttemptOne = substractTime(date, 5, "minutes");
  const dateToRemindAttemptTwo = substractTime(date, 2, "minutes");
  const dateToRemindAttemptThree = substractTime(date, 1, "minute");
  const dateToSendFeedback = addTime(date, 2, "minutes");

  return makeLambdaResponse<MentorshipResponse>(callback, {
    responseMessage: RESPONSE_CODES["100"],
    responseCode: "100",
    responseData: {
      mentorship: {
        mentorId,
        mentorEmail,
        mentorName,
        menteeId,
        menteeEmail,
        menteeName,
        menteeTimezone,
        mentorTimezone,
        mentorshipId,
        mentorship_duration
      },
      dateToRemindConfirmationAttemptOne,
      dateToRemindConfirmationAttemptTwo,
      dateToRemindAttemptOne,
      dateToRemindAttemptTwo,
      dateToRemindAttemptThree,
      dateToSendFeedback,
      mentorshipDate,
      mentorship_token,
    },
    confirmationAttempt: 0,
    reminderAttempt: 0,
  });
};

export default createMentorship;
