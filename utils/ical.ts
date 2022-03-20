import ical, {
  ICalAttendeeRole,
  ICalAttendeeStatus,
  ICalAttendeeType,
  ICalCalendarMethod,
} from "ical-generator";
import { IcalData, ICalStatus } from "../types";
import { addTime } from "./dates";

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
    end: addTime(date, data.duration, "minutes"),
    summary: `Mentoría con ${mentorshipWith}`,
    description: `Mentoría con ${mentorshipWith}`,
    location: "FrontendCafé Discord",
    url: "https://discord.com/channels/594363964499165194/897162165272842240",
  });

  return calendar.toString();
}
