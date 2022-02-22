import ical, {
  ICalAttendeeRole,
  ICalAttendeeStatus,
  ICalAttendeeType,
  ICalCalendarMethod,
  ICalEventStatus,
} from "ical-generator";
import { addTime } from "./dates";

interface IcalData {
  mentorshipId: string;
  mentorName: string;
  menteeName: string;
  mentorEmail: string;
  menteeEmail: string;
  timezone: string;
}

export enum ICalStatus {
  REQUEST = ICalCalendarMethod.REQUEST,
  CANCEL = ICalCalendarMethod.CANCEL,
}

export function createICS(
  date: Date,
  mentorshipWith: string,
  data: IcalData,
  type: ICalStatus = ICalStatus.REQUEST
): string {
  const attendeeStatus =
    type === ICalStatus.CANCEL
      ? ICalAttendeeStatus.DECLINED
      : ICalAttendeeStatus.ACCEPTED;
  const calendar = ical();
  calendar.method(ICalCalendarMethod.REQUEST);
  calendar.createEvent({
    id: data.mentorshipId,
    attendees: [
      {
        name: data.mentorName,
        email: data.mentorEmail,
        mailto: data.mentorEmail,
        role: ICalAttendeeRole.REQ,
        rsvp: true,
        type: ICalAttendeeType.INDIVIDUAL,
        status: attendeeStatus,
      },
      {
        name: data.menteeName,
        email: data.menteeEmail,
        mailto: data.menteeEmail,
        role: ICalAttendeeRole.REQ,
        rsvp: true,
        type: ICalAttendeeType.INDIVIDUAL,
        status: attendeeStatus,
      },
    ],
    organizer: {
      name: data.mentorName,
      email: data.mentorEmail,
      mailto: data.mentorEmail,
    },
    priority: 1,
    timezone: data.timezone ?? "America/Buenos_Aires",
    start: date,
    end: addTime(date, 1, "hours"),
    summary: `Mentoría con ${mentorshipWith}`,
    description: `Mentoría con ${mentorshipWith}`,
    location: "FrontendCafé Discord",
    url: "https://discord.com/channels/594363964499165194/897162165272842240",
  });

  return calendar.toString();
}