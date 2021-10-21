export const TABLE_NAME_USER: string = "user";
export const TABLE_NAME_TIME_SLOT: string = "time-slots";
export const TABLE_NAME_MENTORSHIP: string = "mentorship";

export const STATUS = {
  ACTIVE: "ACTIVE",
  CANCEL: "CANCEL",
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
  "100": "Succesfully mentorship created.",
};
