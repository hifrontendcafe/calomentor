import { TABLE_NAME_TIME_SLOT } from "../constants";
import { get } from "../utils/dynamoDb";
import { TimeSlot } from "../types";

export function getTimeSlotById(id) {
  return get<TimeSlot>({
    TableName: TABLE_NAME_TIME_SLOT,
    Key: { id },
  });
}
