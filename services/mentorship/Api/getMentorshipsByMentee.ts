import type { APIGatewayProxyHandler } from 'aws-lambda';
import { getMentorshipByMenteeId } from '../../../repository/mentorship';
import {
  makeSuccessResponse,
  makeErrorResponse
} from '../../../utils/makeResponses';

const getMentorshipsByMentee: APIGatewayProxyHandler = async event => {
  const { pathParameters } = event;

  const { id } = pathParameters;

  if (!id) return makeErrorResponse(400, '-107');

  const data = await getMentorshipByMenteeId(id);

  return makeSuccessResponse(
    data.Items,
    '1',
    data.Items.length,
    data.LastEvaluatedKey
  );
};

export default getMentorshipsByMentee;
