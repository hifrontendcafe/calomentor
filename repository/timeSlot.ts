import { TABLE_NAME_TIME_SLOT } from "../constants";
import { get } from "../utils/dynamoDb";

export function getTimeSlotById(id) {
  return get({
    TableName: TABLE_NAME_TIME_SLOT,
    Key: { id },
  });
}
