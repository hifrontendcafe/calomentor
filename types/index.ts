import { STATUS, WARN, WARNSTATE } from "../constants";

export interface TimeSlot {
  id: string;
  user_id: string;
  date: number;
  is_occupied: boolean;
  is_cancelled?: boolean;
  mentee_username: string;
  mentee_id: string;
  tokenForCancel: string;
}

export interface Mentorship {
  mentee_email: string;
  mentee_username_discord: string;
  mentor_email: string;
  feedback_mentor: string;
  feedback_mentee: string;
  mentor_id: string;
  mentor_name: string;
  info: string;
  mentee_name: string;
  tokenForCancel: string;
  mentee_id: string;
  mentorship_status: STATUS;
  id: string;
  cancel_cause: string;
  who_cancel: "MENTOR" | "MENTEE";
  time_slot_info?: TimeSlot;
  time_slot_id?: string;
  feedback_mentee_private?: string;
  warning_info?: Warning;
  feedback_stars: 1 | 2 | 3 | 4 | 5;
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
  isActive: boolean;
  lastActivateBy: string; // discord id
  timezone: string;
  userToken: string;
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
  status: WARNSTATE;
  forgive_cause?: string;
  warning_author_id: string;
  warning_author_name: string;
}
