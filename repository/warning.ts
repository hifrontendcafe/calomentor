import { TABLE_NAME_WARNINGS } from "../constants";
import { Warning } from "../types";

import { generateUpdateQuery, put, scan, update } from "../utils/dynamoDb";

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
      "id, mentee_id, warn_type, warn_cause, mentorship_id, warning_date, forgive_cause, mentor_name, mentee_name, warning_status, warning_author_id, warning_author_name";
  }

  return scan<Warning>(query);
}

export function updateWarning(
  id: string,
  data: Partial<Warning>,
  allowedToUpdate: (keyof Warning)[] = null
) {
  let updateExpression: ReturnType<typeof generateUpdateQuery>;
  try {
    updateExpression = generateUpdateQuery<Partial<Warning>>(
      data,
      allowedToUpdate
    );
  } catch (err) {
    throw err;
  }

  return update<Warning>({
    TableName: TABLE_NAME_WARNINGS,
    Key: { id },
    ConditionExpression: "attribute_exists(id)",
    ReturnValues: "ALL_NEW",
    ...updateExpression,
  });
}
