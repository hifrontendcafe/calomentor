import * as dayjs from "dayjs";
import * as timezone from "dayjs/plugin/timezone";
import * as utc from "dayjs/plugin/utc";
import * as localizedFormat from "dayjs/plugin/localizedFormat";
import * as isBetween from "dayjs/plugin/isBetween";
import "dayjs/locale/es-mx";

dayjs.extend(localizedFormat);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isBetween);

const timeZone: string = "America/Montevideo";
const locale: string = "es-mx";

export const toDateString: (date: Date) => string = (date) => {
  return dayjs(date).tz(timeZone).locale(locale).format("LL");
};

export const toTimeString: (date: Date) => string = (date) => {
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
