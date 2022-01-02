export const TABLE_NAME_USER = "user";
export const TABLE_NAME_TIME_SLOT = "time-slots";
export const TABLE_NAME_MENTORSHIP = "mentorship";
export const TABLE_NAME_WARNINGS = "warnings";

export const STATUS = {
  ACTIVE: "ACTIVE",
  CANCEL: "CANCEL",
  CONFIRMED: "CONFIRMED",
  WITHWARNING: "WITHWARNING",
} as const;

export const FILTERDATES = {
  PAST: "PAST",
  FUTURE: "FUTURE",
  ALL: "ALL",
} as const;

export const WARNSTATE = {
  ACTIVE: "ACTIVE",
  FORGIVE: "FORGIVE",
} as const;

export const WARNTYPE = ["NO_ASSIST", "COC_WARN"] as const;

export const RESPONSE_CODES = {
  "0": "OK.",
  "-1": "Unexpected error.",
  "-100":
    "Bad Request: Missing params. The required params are mentor_id, mentee_id, mentee_email, status, time_slot_id, time_slot_time",
  "-101": "Unable to get the mentor.",
  "-102": "Unable to create the mentorship.",
  "-103": "Unable to get the time slot.",
  "-104": "Unable to get the mentorship.",
  "-105": "Unable to update the mentorship.",
  "-106": "Unable to get the timezone.",
  "-107": "Unable to get mentorships.",
  "-108": "There is no mentorships.",
  "-109": "The Mentorship is confirmed or cancelled.",
  "-110": "There was a problem with the confirmation",
  "-111": "The mentorship is not confirmed",
  "-112": "The mentorship already has a feedback",
  "-113": "Bad Request: user_id, date y slots are required",
  "-200": "Unable to create user. User already exists.",
  "-201": "Unable to create user.",
  "-202": "There is no mentors",
  "-203": "Unable to get mentors.",
  "-204": "User not found",
  "-205": "Unable to get user by id",
  "-300": "Unable to add a warning",
  "-301": "The mentee id and email is required",
  "-302": "The mentee has warnings",
  "-303": "Unable to get warnings",
  "-304": "The mentee id is required",
  "-305": "Unable to delete the warning",
  "-306": "Unable to add a Time Slot",
  "-307": "Unable to get Time Slots",
  "-308": "Time slot not found",
  "-309": "There was an error trying to update the time slot",
  "-310": "Bad Request: Missing params. The required params are id and slot",
  "-311": "Bad Request: Missing params. id is required",
  "-312":
    "Bad Request: Missing params. The required params are mentee_username, mentee_id and tokenForCancel",
  "-313": "There was an error trying to delete the slot",
  "-314": "Time slot not found",
  "-315": "Bad Request: id is required or is not a string.",
  "-316": "There was an error trying to delete the user",
  "-317": "There was an error trying to update the user",
  "-318": "There was an error trying to update the user. Id not found",
  "-319":
    "Bad Request: isActive property is missing or is not allowable option.",
  "100": "Succesfully mentorship created.",
  "101": "Mentorship confirmed",
  "102": "Update feedback succesfully",
  "103": "Time slot added",
  "104": "Time slot updated",
  "105": "Time slot successfully deleted",
  "200": "User created succesfully",
  "201": "User",
  "202": "User successfully deleted",
  "203": "User successfully updated",
  "300": "Warning added",
  "301": "There is no warnings for this mentee",
  "302": "Warnings",
  "303": "Warning deleted",
} as const;
