import { APIGatewayProxyHandler } from 'aws-lambda/trigger/api-gateway-proxy';
import dayjs from 'dayjs';
import {
  getAllMentorships,
  getMentorshipBetweenTwoDates
} from '../repository/mentorship';
import { getMentors } from '../repository/user';
import {
  getWarningBetweenTwoDates,
  getWarningsData
} from '../repository/warning';
import {
  getFirstDayOfMonth,
  getFirstDayOfWeek,
  getFirstDayOfYear,
  getLastDayOfMonth,
  getLastDayOfYear,
  substractTime
} from '../utils/dates';
import { makeErrorResponse, makeSuccessResponse } from '../utils/makeResponses';
import { promiseHash } from '../utils/promise';

export const getMetrics: APIGatewayProxyHandler = async event => {
  // Get dates for search metrics

  const today = new Date();
  const firstDayOfTheYear = getFirstDayOfYear(today.getTime());
  const firstDayOfTheMonth = getFirstDayOfMonth(today.getTime());
  const firstDayOfTheWeek = getFirstDayOfWeek(today.getTime());
  const todayMinusTwentyFourHours = String(
    substractTime(today, 24, 'hours').getTime()
  );
  const firstDayOfTheLastYear = getFirstDayOfYear(
    substractTime(today, 1, 'year').getTime()
  );
  const firstDayOfTheLastMonth = getFirstDayOfMonth(
    substractTime(today, 1, 'month').getTime()
  );
  const lastDayOfTheLastYear = getLastDayOfYear(today.getTime());
  const lastDayOfTheLastMonth = getLastDayOfMonth(today.getTime());

  try {
    const data = await promiseHash({
      // Get Mentors metrics

      mentors: getMentors(),

      // Get Mentorships metrics

      mentorshipsOfTheYear: getMentorshipBetweenTwoDates(
        firstDayOfTheYear,
        String(today.getTime())
      ),
      mentorshipsOfTheMonth: getMentorshipBetweenTwoDates(
        firstDayOfTheMonth,
        String(today.getTime())
      ),
      mentorshipsOfTheWeek: getMentorshipBetweenTwoDates(
        firstDayOfTheWeek,
        String(today.getTime())
      ),
      mentorshipsOfTheDay: getMentorshipBetweenTwoDates(
        String(todayMinusTwentyFourHours),
        String(today.getTime())
      ),
      mentorshipsOfTheLastMonth: getMentorshipBetweenTwoDates(
        String(firstDayOfTheLastMonth),
        String(lastDayOfTheLastMonth)
      ),
      mentorshipsOfTheLastYear: getMentorshipBetweenTwoDates(
        String(firstDayOfTheLastYear),
        String(lastDayOfTheLastYear)
      ),

      allMentorships: getAllMentorships(),

      // Get Warnings metrics

      warningsOfTheYear: getWarningBetweenTwoDates(
        firstDayOfTheYear,
        String(today.getTime())
      ),
      warningsOfTheMonth: getWarningBetweenTwoDates(
        firstDayOfTheMonth,
        String(today.getTime())
      ),
      warningsOfTheWeek: getWarningBetweenTwoDates(
        firstDayOfTheWeek,
        String(today.getTime())
      ),
      warningsOfTheDay: getWarningBetweenTwoDates(
        String(todayMinusTwentyFourHours),
        String(today.getTime())
      ),
      warningsOfTheLastMonth: getWarningBetweenTwoDates(
        String(firstDayOfTheLastMonth),
        String(lastDayOfTheLastMonth)
      ),
      warningsOfTheLastYear: getWarningBetweenTwoDates(
        String(firstDayOfTheLastYear),
        String(lastDayOfTheLastYear)
      ),

      allWarnings: getWarningsData({ allWarnings: true })
    });

    const activeMentors = data.mentors?.filter(mentor => mentor.isActive);

    return makeSuccessResponse(
      {
        mentorships_metrics: {
          mentorshipsOfTheYear: data.mentorshipsOfTheYear.Count,
          mentorshipsOfTheLastYear: data.mentorshipsOfTheLastYear.Count,
          mentorshipsOfTheMonth: data.mentorshipsOfTheMonth.Count,
          mentorshipsOfTheLastMonth: data.mentorshipsOfTheLastMonth.Count,
          mentorshipsOfTheWeek: data.mentorshipsOfTheWeek.Count,
          mentorshipsOfTheDay: data.mentorshipsOfTheDay.Count,
          mentorshipsOfTheCurrentMonthOverLastMonth:
            data.mentorshipsOfTheMonth.Count /
            data.mentorshipsOfTheLastMonth.Count,
          mentorshipsOfTheCurrentYearOverLastYear:
            data.mentorshipsOfTheYear.Count /
            data.mentorshipsOfTheLastYear.Count,
          mentorshipsTotal: data.allMentorships.Count,
          mentorshipsTotalOverActiveMentorsOfTheMonth:
            data.mentorshipsOfTheYear.Count / activeMentors.length,
          mentorshipsTotalOverActiveMentorsOfTheYear:
            data.mentorshipsOfTheMonth.Count / activeMentors.length,
          all_mentorships: data.allMentorships.Items
        },
        warnings_metrics: {
          warningsOfTheYear: data.warningsOfTheYear.Count,
          warningsOfTheLastYear: data.warningsOfTheLastYear.Count,
          warningsOfTheMonth: data.warningsOfTheMonth.Count,
          warningsOfTheLastMonth: data.warningsOfTheLastMonth.Count,
          warningsOfTheWeek: data.warningsOfTheWeek.Count,
          warningsOfTheDay: data.warningsOfTheDay.Count,
          warningsOfTheCurrentMonthOverLastMonth:
            data.warningsOfTheMonth.Count / data.warningsOfTheLastMonth.Count,
          warningsOfTheCurrentYearOverLastYear:
            data.warningsOfTheYear.Count / data.warningsOfTheLastYear.Count,
          warningsTotal: data.warningsOfTheYear.ScannedCount,
          warningsOverMentorshipsOfTheWeek:
            data.warningsOfTheWeek.Count / data.mentorshipsOfTheWeek.Count,
          warningsOverMentorshipsOfTheMonth:
            data.warningsOfTheMonth.Count / data.mentorshipsOfTheMonth.Count,
          warningsOverMentorshipsOfTheYear:
            data.warningsOfTheYear.Count / data.mentorshipsOfTheYear.Count,
          all_warnings: data.allWarnings.Items
        },
        mentors: {
          total: data.mentors?.length,
          active: activeMentors?.length
        },
        dates: {
          today,
          firstDayOfTheYear,
          firstDayOfTheMonth,
          firstDayOfTheWeek,
          todayMinusTwentyFourHours,
          firstDayOfTheLastYear,
          firstDayOfTheLastMonth,
          lastDayOfTheLastYear,
          lastDayOfTheLastMonth
        }
      },
      '999'
    );
  } catch (error) {
    return makeErrorResponse(400, '-999', error?.stack);
  }
};

export const getMentorshipsMetricsBetweenTwoDates: APIGatewayProxyHandler =
  async event => {
    const { dateOne, dateTwo } = event.queryStringParameters;

    const today = String(Date.now());

    try {
      const mentorships = await getMentorshipBetweenTwoDates(
        dateOne,
        dateTwo || today
      );
      const warnings = await getWarningBetweenTwoDates(
        dateOne,
        dateTwo || today
      );
      return makeSuccessResponse(
        {
          // all_mentorships: mentorships.Items,
          mentorships_count: mentorships.Count,
          warnings_count: warnings.Count
        },
        '999'
      );
    } catch (error) {
      return makeErrorResponse(400, '-999', error?.stack);
    }
  };

export const getWarningsMetricsBetweenTwoDates: APIGatewayProxyHandler =
  async event => {
    const { dateOne, dateTwo } = event.queryStringParameters;

    const today = String(Date.now());
    try {
      const warnings = await getWarningBetweenTwoDates(
        dateOne,
        dateTwo || today
      );
      return makeSuccessResponse(
        {
          all_warnings: warnings.Items,
          warnings_count: warnings.Count
        },
        '999'
      );
    } catch (error) {
      return makeErrorResponse(400, '-999', error?.stack);
    }
  };
