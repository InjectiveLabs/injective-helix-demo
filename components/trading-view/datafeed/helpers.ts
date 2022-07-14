import {
  getHours,
  getMinutes,
  getTime,
  set,
  subHours,
  subMinutes
} from 'date-fns'

export function getErrorMessage(error: any) {
  if (error === undefined) {
    return ''
  } else if (typeof error === 'string') {
    return error
  }

  return error.message
}

const roundToNearestHour = (timestamp: number, resolution: string) => {
  if (resolution.includes('D') || resolution.includes('W')) {
    return getTime(set(timestamp, { hours: 23, minutes: 59, seconds: 59 }))
  }

  const hour = Number(resolution) / 60
  const hours = getHours(timestamp)
  const hoursToSubtract = hours % hour

  return getTime(
    set(subHours(timestamp, hoursToSubtract), {
      minutes: 0,
      seconds: 0,
      milliseconds: 0
    })
  )
}

const roundToNearestMinute = (timestamp: number, resolution: string) => {
  const minute = Number(resolution)
  const minutes = getMinutes(timestamp)
  const minsToSubtract = minutes % minute

  return getTime(
    set(subMinutes(timestamp, minsToSubtract), {
      seconds: 0,
      milliseconds: 0
    })
  )
}

export const roundTimestampByResolution = (
  resolution: string,
  timestamp: number
): string => {
  const interval = Number(resolution)

  if (Number.isNaN(interval) || interval > 30) {
    return roundToNearestHour(timestamp, resolution).toString()
  }

  return roundToNearestMinute(timestamp, resolution).toString()
}
