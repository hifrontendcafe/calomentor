import { APIGatewayProxyHandler } from "aws-lambda/trigger/api-gateway-proxy";
import { deleteMentorship } from "../../../repository/mentorship";
import { makeErrorResponse, makeSuccessResponse } from "../../../utils/makeResponses";

const deleteMentorshipById: APIGatewayProxyHandler = async (event) => {
  const id = event.pathParameters?.id;

  try {
    if (!id) {
      return makeErrorResponse(400, "-121");
    }

    await deleteMentorship(id);

    return makeSuccessResponse({}, "106");
  } catch (error) {
    return makeErrorResponse(400, "-122", error);
  }
};

export default deleteMentorshipById