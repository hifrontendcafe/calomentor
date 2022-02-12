import * as dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import localizedFormat from 'dayjs/plugin/localizedFormat'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(localizedFormat)

const timeZone: string = "America/Montevideo";
const locale: string = "es-AR";

export const toDateString: (date: Date) => string = (date) => {
  return dayjs(date).tz(timeZone).format("LL")
};

export const toTimeString: (date: Date) => string = (date) => {
  return dayjs(date).tz(timeZone).format("LT")
};

export const isPastDate = (date: Date, dateToCompare?: Date): boolean => {
  return dayjs(dateToCompare).isAfter(dayjs(date))
};

export const isFutureDate = (date: Date, dateToCompare?: Date): boolean => {
  return dayjs(dateToCompare).isBefore(dayjs(date))
};

export const isSameDate = (dateOne: Date, dateTwo: Date): boolean => {
  return dayjs(dateOne).isSame(dayjs(dateTwo))
};

export const addTime = (date: Date, timeToAdd: number, unit: dayjs.UnitType): Date => {
  return dayjs(date).add(timeToAdd, unit).toDate()
};

export const substractTime = (date: Date, timeToAdd: number, unit: dayjs.UnitType): Date => {
  return dayjs(date).subtract(timeToAdd, unit).toDate()
};