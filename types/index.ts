import {
  STATUS,
  WARN,
  WARNSTATE,
  WHOCANCELED,
  TIMESLOT_STATUS,
  USER_STATUS,
} from "../constants";

import { ICalCalendarMethod } from "ical-generator";

export interface TimeSlot {
  id: string;
  user_id: string;
  date: number;
  timeslot_status: TIMESLOT_STATUS;
  mentee_username: string;
  mentee_id: string;
  mentorship_token: string;
  duration: 30 | 45 | 60;
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
  user_status: USER_STATUS;
  modified_by: string; // discord id
  user_timezone: string;
  user_token: string;
  accepted_coc: boolean;
}

interface SanityPersonaInterface {
  _createdAt: string;
  _id: string;
  _rev: string;
  _type: string;
  _updatedAt: string;
  discordID: {
    _type: string;
    current: string;
  };
  email: string;
  firstName: string;
  github: string;
  lastName: string;
  linkedin: string;
  photo: {
    _type: string;
    asset: {
      _ref: string;
      _type: string;
    };
  };
  timezone: string;
  twitter: string;
  username: string;
}

interface Topics {
  _key: string;
  _ref: string;
  _type: string;
}

export interface Mentor {
  _id: string;
  calendly: string;
  description: string;
  github?: string;
  isActive: boolean;
  linkedin: string;
  name: string;
  persona: SanityPersonaInterface;
  photo?: {
    alt?: string;
    src: string;
  };
  topics: Topics[];
  web?: string;
  status?: USER_STATUS
  feedback?:  1 | 2 | 3 | 4 | 5;
}
export interface Warning {
  id: string;
  warning_date: number;
  mentee_id: string;
  mentee_name?: string;
  mentee_username_discord?: string;
  mentor_name?: string;
  warn_type: WARN;
  warn_cause: string;
  mentorship_id: string;
  warning_status: WARNSTATE;
  forgive_cause?: string;
  warning_author_id: string;
  warning_author_name: string;
  warning_author_username_discord: string;
  forgive_author_id: string;
  forgive_author_name: string;
  forgive_author_username_discord: string;
  searcheable_warning_author_name: string;
  searcheable_warning_author_username_discord: string;
  searcheable_mentee_name: string;
  searcheable_mentee_username_discord: string;
  searcheable_mentor_name?: string;
  searcheable_mentor_username_discord?: string;
  searcheable_forgive_author_name?: string;
  searcheable_forgive_author_username_discord?: string;
  from_bot?: boolean;
}

export interface Mentorship {
  mentee_email: string;
  mentee_username_discord: string;
  mentor_email: string;
  mentor_id: string;
  mentor_name: string;
  mentor_username_discord: string;
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
  warning_info?: Warning;
  mentee_timezone: string;
  mentor_timezone?: string;
  mentorship_create_date?: string;
  from_bot?: boolean;
  searcheable_mentor_name: string;
  searcheable_mentor_username_discord: string;
  searcheable_mentee_name: string;
  searcheable_mentee_username_discord: string;
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
  mentorship_duration: 30 | 45 | 60;
}

export interface MentorshipRequestBody {
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
  mentorship_duration: 30 | 45 | 60;
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

export interface Feedback {
  id: string;
  mentor_id: string;
  mentor_username_discord: string;
  mentor_name: string;
  mentee_id: string;
  mentee_username_discord: string;
  mentee_name: string;
  feedback_date: string;
  feedback_stars: 1 | 2 | 3 | 4 | 5;
  feedback_mentee: Record<string, string>;
  feedback_mentee_private?: Record<string, string>;
}

export interface IcalData {
  mentorshipId: string;
  mentorName: string;
  menteeName: string;
  mentorEmail: string;
  menteeEmail: string;
  timezone: string;
  duration: 30 | 45 | 60;
}

export enum ICalStatus {
  REQUEST = ICalCalendarMethod.REQUEST,
  CANCEL = ICalCalendarMethod.CANCEL,
}
