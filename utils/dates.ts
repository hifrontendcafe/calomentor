import * as dayjs from "dayjs";
import * as timezone from "dayjs/plugin/timezone";
import * as utc from "dayjs/plugin/utc";
import * as localizedFormat from "dayjs/plugin/localizedFormat";
import * as isBetween from "dayjs/plugin/isBetween";
import * as  relativeTime from 'dayjs/plugin/relativeTime';
import "dayjs/locale/es-mx";

dayjs.extend(localizedFormat);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isBetween);
dayjs.extend(relativeTime);

export const toDateString: (
  date: Date,
  timeZone?: string,
  locale?: string
) => string = (date, timeZone = "America/Buenos_Aires", locale = "es-mx") => {
  return dayjs(date).tz(timeZone).locale(locale).format("LL");
};

export const toTimeString: (
  date: Date,
  timeZone?: string,
  locale?: string
) => string = (date, timeZone = "America/Buenos_Aires", locale = "es-mx") => {
  return dayjs(date).tz(timeZone).locale(locale).format("LT");
};

export const isPastDate = (date: Date, dateToCompare?: Date): boolean => {
  return dayjs(dateToCompare).isAfter(dayjs(date));
};

export const isFutureDate = (date: Date, dateToCompare?: Date): boolean => {
  return dayjs(dateToCompare).isBefore(dayjs(date));
};

export const isSameDate = (dateOne: Date, dateTwo: Date): boolean => {
  return dayjs(dateOne).isSame(dayjs(dateTwo));
};

export const dateIsBetween = (
  dateToCompare: Date,
  dateOne: Date,
  dateTwo: Date
): boolean => {
  return dayjs(dateToCompare).isBetween(dateOne, dateTwo);
};

export const addTime = (
  date: Date,
  timeToAdd: number,
  unit: dayjs.UnitType
): Date => {
  return dayjs(date).add(timeToAdd, unit).toDate();
};

export const substractTime = (
  date: Date,
  timeToAdd: number,
  unit: dayjs.UnitType
): Date => {
  return dayjs(date).subtract(timeToAdd, unit).toDate();
};

export const getUnixTime = (date: Date): number => {
  return dayjs(date).unix();
}

export const distanceFromNow = (date: Date, timeZone = "America/Buenos_Aires", locale = "es-mx"): string => {
  return dayjs(date).tz(timeZone).locale(locale).fromNow();
}

export const distanceToNow = (date: Date, timeZone = "America/Buenos_Aires", locale = "es-mx"): string => {
  return dayjs(date).tz(timeZone).locale(locale).toNow();
}
