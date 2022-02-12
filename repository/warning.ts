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