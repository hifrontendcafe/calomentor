import { Handler } from "aws-lambda";
import { RESPONSE_CODES } from "../../../constants";
import { MentorshipResponse } from "../../../types";
import { addTime, substractTime } from "../../../utils/dates";
import { makeLambdaResponse } from "../../../utils/makeResponses";

interface MentorshipRequestBody {
  mentorId: string;
  menteeId: string;
  menteeName: string;
  menteeEmail: string;
  menteeTimezone: string;
  mentorTimezone: string;
  mentorName: string;
  mentorEmail: string;
  mentorshipDate: Date;
  mentorship_token: string;
  mentorshipId: string;
}

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
  } = event;

  const date = new Date(mentorshipDate);

  const dateToRemindConfirmationAttemptOne = substractTime(date, 3, "days");
  const dateToRemindConfirmationAttemptTwo = substractTime(date, 2, "days");
  const dateToRemindAttemptOne = substractTime(date, 1, "day");
  const dateToRemindAttemptTwo = substractTime(date, 1, "hour");
  const dateToRemindAttemptThree = substractTime(date, 10, "minutes");
  const dateToSendFeedback = addTime(date, 1, "hours");

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
