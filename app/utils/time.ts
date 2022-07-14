import { BigNumber, SECONDS_IN_A_DAY } from '@injectivelabs/utils'
import { formatDuration, intervalToDuration } from 'date-fns'

export const tomorrow = (): BigNumber => {
  return new BigNumber(Math.floor(new Date().valueOf() / 1000) + 3600 * 24)
}

export const todayInSeconds = (): number => {
  return Math.floor(Date.now() / 1000)
}

export const past24Hours = (): number => {
  return new BigNumber(todayInSeconds()).minus(SECONDS_IN_A_DAY).toNumber()
}

export const pastDays = (day = 1): number => {
  return new BigNumber(todayInSeconds())
    .minus(SECONDS_IN_A_DAY.times(day))
    .toNumber()
}

export const getEndDateStringFromTimeInSeconds = (
  timeInSeconds: BigNumber
): string => {
  const currentDate = new Date(timeInSeconds.toNumber() * 1000)

  return currentDate.toLocaleString('en-us')
}

export const formatDurationFromSeconds = (seconds: number): string => {
  const countDownDisplaySuffix: Record<string, any> = {
    xDays: 'd',
    xHours: 'h',
    xMinutes: 'm',
    xSeconds: 's'
  }
  const duration = intervalToDuration({ start: 0, end: seconds * 1000 })

  return formatDuration(duration, {
    format: ['days', 'hours', 'minutes', 'seconds'],
    locale: {
      formatDistance: (type, count) => {
        const formattedCount = count < 10 ? `0${count}` : count

        return `${formattedCount}${countDownDisplaySuffix[type]}`
      }
    }
  })
}
