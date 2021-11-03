export const TABLE_NAME_USER: string = "user";
export const TABLE_NAME_TIME_SLOT: string = "time-slots";
export const TABLE_NAME_MENTORSHIP: string = "mentorship";

export const STATUS = {
  ACTIVE: "ACTIVE",
  CANCEL: "CANCEL",
  CONFIRMED: "CONFIRMED",
};

export const FILTERDATES = {
  PAST: "PAST",
  FUTURE: "FUTURE",
  ALL: "ALL",
};

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
  "-200": "Unable to create user. User already exists.",
  "-201": "Unable to create user.",
  "-202": "There is no mentors",
  "-203": "Unable to get all mentors.",
  "-204": "User not found",
  "-205": "Unable to get user by id",
  "100": "Succesfully mentorship created.",
  "101": "Mentorship confirmed",
  "102": "Update feedback succesfully",
  "200": "User created succesfully",
  "201": "User ",
};
