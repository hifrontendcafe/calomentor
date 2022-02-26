import { STATUS, WARN, WARNSTATE, WHOCANCELED } from "../constants";

export interface TimeSlot {
  id: string;
  user_id: string;
  date: number;
  is_occupied: boolean;
  is_cancelled?: boolean;
  mentee_username: string;
  mentee_id: string;
  mentorship_token: string;
  duration: 30 | 45 | 60;
}

export interface Mentorship {
  mentee_email: string;
  mentee_username_discord: string;
  mentor_email: string;
  feedback_mentee: string;
  mentor_id: string;
  mentor_name: string;
  info: string;
  mentee_name: string;
  mentorship_token: string;
  mentee_id: string;
  mentorship_status: STATUS;
  id: string;
  cancel_cause: string;
  who_canceled: WHOCANCELED;
  time_slot_info?: TimeSlot;
  time_slot_id?: string;
  feedback_stars: 1 | 2 | 3 | 4 | 5;
  feedback_mentee_private?: string;
  warning_info?: Warning;
  mentee_timezone: string;
  mentor_timezone?: string;
}

interface UserLinks {
  github: string;
  twitter: string;
  linkedin: string;
  portfolio: string;
}

export type Role = "admin" | "mentor";

export interface User {
  id: string;
  discord_username?: string;
  full_name?: string;
  about_me?: string;
  email?: string;
  url_photo?: string;
  role?: Role[];
  links?: UserLinks;
  skills?: string[];
  is_active: boolean;
  last_active_by: string; // discord id
  user_timezone: string;
  user_token: string;
}

export interface Warning {
  id: string;
  warning_date: number;
  mentee_id: string;
  mentee_name?: string;
  mentor_name?: string;
  warn_type: WARN;
  warn_cause: string;
  mentorship_id: string;
  warning_status: WARNSTATE;
  forgive_cause?: string;
  warning_author_id: string;
  warning_author_name: string;
}

export interface MentorshipStateMachine {
  mentorId: string;
  menteeId: string;
  menteeName: string;
  menteeEmail: string;
  menteeTimezone: string;
  mentorTimezone: string;
  mentorName: string;
  mentorEmail: string;
  mentorshipId: string;
}

export interface MentorshipResponse {
  responseMessage: string;
  responseCode: string;
  responseData: {
    mentorship: MentorshipStateMachine;
    dateToRemindConfirmationAttemptOne?: Date;
    dateToRemindConfirmationAttemptTwo?: Date;
    dateToRemindAttemptOne?: Date;
    dateToRemindAttemptTwo?: Date;
    dateToRemindAttemptThree?: Date;
    dateToSendFeedback?: Date;
    mentorshipDate: Date;
    mentorship_token: string;
  };
  isCancel?: boolean;
  isConfirm?: boolean;
  confirmationAttempt?: number;
  reminderAttempt?: number;
}
