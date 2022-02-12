import { TABLE_NAME_WARNINGS } from "../constants";
import { Warning } from "../types";

import {
  deleteItem,
  generateUpdateQuery,
  get,
  put,
  scan,
  update,
} from "../utils/dynamoDb";

export function addWarning(warning: Warning) {
  return put<Warning>({
    TableName: TABLE_NAME_WARNINGS,
    Item: warning,
  });
}

export function getWarningsData(id?: string) {
  let query: Parameters<typeof scan>[0] = {
    TableName: TABLE_NAME_WARNINGS,
  };

  if (id) {
    query.FilterExpression = "mentee_id = :mentee_id";
    query.ExpressionAttributeValues = {
      ":mentee_id": id,
    };
  } else {
    query.ProjectionExpression =
      "id, mentee_id, warn_type, warn_cause, mentorship_id, date, forgive_cause";
  }

  return scan<Warning>(query);
}
