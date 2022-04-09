export const TABLE_NAME_USER = "user";
export const TABLE_NAME_TIME_SLOT = "time-slots";
export const TABLE_NAME_MENTORSHIP = "mentorship";
export const TABLE_NAME_WARNINGS = "warnings";

export enum STATUS {
  ACTIVE = "ACTIVE",
  CANCEL = "CANCEL",
  CONFIRMED = "CONFIRMED",
  WITHWARNING = "WITHWARNING",
}

export enum FILTERDATES {
  PAST = "PAST",
  FUTURE = "FUTURE",
  ALL = "ALL",
}

export enum WARNSTATE {
  ACTIVE = "ACTIVE",
  FORGIVE = "FORGIVE",
}

export enum WARN {
  "NO_ASSIST" = "NO_ASSIST",
  "COC_WARN" = "COC_WARN",
}

export enum WHOCANCELED {
  "MENTOR" = "MENTOR",
  "MENTEE" = "MENTEE",
}

export enum TIMESLOT_STATUS {
  OCCUPIED = "OCCUPIED",
  FREE = "FREE",
  CANCELED_BY_MENTOR = "CANCELED_BY_MENTOR",
  FINISHED = "FINISHED",
}

export enum USER_STATUS {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  OUTSIDE_THE_PROGRAM = "OUTSIDE_THE_PROGRAM",
}

/**
 * Negative numbers for failed responses
 * Postiive numbers for success responses
 * 1 as generic stepFunction success response
 * -1 as generic stepFunction failed response
 *
 * Codes:
 *   - 1XX: Mentorships services
 *   - 2XX: Users services
 *   - 3XX: Warnings services
 *   - 4XX: Timeslots services
 */

export const RESPONSE_CODES = {
  "1": "OK.",
  "-1": "Unexpected error.",
  "100": "Succesfully mentorship created.",
  "101": "Mentorship confirmed",
  "102": "Update feedback succesfully",
  "103": "Time slot added",
  "104": "Time slot updated",
  "105": "Time slot successfully deleted",
  "-100":
    "Bad Request: Missing params. The required params are mentor_id, mentor_username_discord, mentee_id, mentee_username_discord",
  "-101": "Unable to get the mentor.",
  "-102": "Unable to create the mentorship.",
  "-103": "Unable to get the time slot.",
  "-104": "Unable to get the mentorship.",
  "-105": "Unable to update the mentorship.",
  "-106": "Unable to get the timezone.",
  "-107": "Unable to get mentorships.",
  "-108": "There is no mentorships.",
  "-109": "The Mentorship is cancelled.",
  "-110": "There was a problem with the confirmation",
  "-111": "The mentorship is not confirmed",
  "-112": "The mentorship already has a feedback",
  "-116": "Bad Request: user is not an admin",
  "-117": "Bad Request: must provide a valid user_token",
  "-118": "Mentee has warnigns",
  "-119": "Time slot is occupied",
  "-120": "Bad Request: must provide a cancel cause and who cancel.",
  "200": "User created succesfully",
  "201": "User",
  "202": "User successfully deleted",
  "203": "User successfully updated",
  "-200": "Unable to create user. User already exists.",
  "-201": "Unable to create user.",
  "-202": "There is no mentors",
  "-203": "Unable to get mentors.",
  "-204": "User not found",
  "-205": "Unable to get user by id",
  "-206": "There was an error trying to delete the user",
  "-207": "There was an error trying to update the user",
  "-208": "There was an error trying to update the user. Id not found",
  "-209":
    "Bad Request: user_status or modified_by properties are missing or is not allowable options.",
  "-210": "There was an error trying to update the user. Token not updated",
  "-211": "Bad Request: id is required or is not a string.",
  "-212": "Bad Request: Missing params. id is required",
  "300": "Warning added",
  "301": "There is no warnings for this mentee",
  "302": "Warnings",
  "303": "Warning deleted",
  "-300": "Unable to add a warning",
  "-301": "The mentee id and email is required",
  "-302": "The mentee has warnings",
  "-303": "Unable to get warnings",
  "-304": "The mentee id is required",
  "-305": "Unable to delete the warning",
  "-315": "Bad Request: id is required or is not a string.",
  "-316": "There was an error trying to delete the user",
  "-317": "There was an error trying to update the user",
  "-318": "There was an error trying to update the user. Id not found",
  "-319":
    "Bad Request: user_status property is missing or is not allowable option.",
  "-320": "There was an error trying to update the user. Token not updated",
  "-306": "Unable to add a Time Slot",
  "-307": "Unable to get Time Slots",
  "-308": "Time slot not found",
  "-309": "There was an error trying to update the time slot",
  "-310": "Bad Request: Missing params. The required params are id and slot",
  "-312":
    "Bad Request: Missing params. The required params are mentee_username, mentee_id and mentorship_token",
  "-313": "There was an error trying to delete the slot",
  "-314": "Time slot not found",
  "-311": "Bad Request: Missing params. id is required",
  "400": "Time slot added",
  "401": "Time slot updated",
  "402": "Time slot successfully deleted",
  "-401": "Bad Request: user_id, date y slots are required",
  "-402": "Bad Request: date is past",
  "-403":
    "Bad Request: already has a timeslot with this date or has another slot in the next 45 minutes.",
  "-404": "Unable to add a Time Slot",
  "-405": "Unable to get Time Slots",
  "-406": "Unable to get the time slot.",
  "-407": "Time slot not found",
  "-408": "Bad Request: Missing params. id is required",
  "-409": "There was an error trying to update the time slot",
  "-410":
    "Bad Request: Missing params. The required params are mentee_username, mentee_id and mentorship_token",
  "-411": "Bad Request: Missing params. The required params are id and slot",
  "-412": "There was an error trying to delete the slot",
  "-413": "Time slot not found",
  "-414": "Time slot is asociated with a mentorship",
} as const;
