import {
  set,
  getTime,
  getHours,
  subHours,
  getMinutes,
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

const timezones: { [key: string]: string } = {
  0: 'Europe/London',
  '-120': 'Europe/Tallinn',
  '-60': 'Europe/Zurich',
  180: 'America/Santiago',
  300: 'America/Toronto',
  240: 'America/Caracas',
  360: 'America/Mexico_City',
  540: 'America/Juneau',
  480: 'America/Vancouver',
  420: 'US/Mountain',
  120: 'America/Sao_Paulo',
  '-360': 'Asia/Almaty',
  '-300': 'Asia/Ashkhabad',
  '-180': 'Europe/Moscow',
  '-420': 'Asia/Jakarta',
  '-480': 'Asia/Taipei',
  '-240': 'Asia/Muscat',
  '-345': 'Asia/Kathmandu',
  '-330': 'Asia/Kolkata',
  '-540': 'Asia/Tokyo',
  '-210': 'Asia/Tehran',
  '-660': 'Pacific/Norfolk',
  '-630': 'Australia/Adelaide',
  '-600': 'Australia/Brisbane',
  '-780': 'Pacific/Fakaofo',
  '-825': 'Pacific/Chatham',
  600: 'Pacific/Honolulu'
}

export function getTimezone(): string {
  const offset = new Date().getTimezoneOffset()

  if (Object.prototype.hasOwnProperty.call(timezones, offset)) {
    return timezones[offset.toString()]
  }

  return 'Etc/UTC'
}

export function shouldSkipBar(symbol: string, timestamp: number) {
  if (
    symbol === 'factory/inj1nw35hnkz5j74kyrfq9ejlh2u4f7y7gt7c3ckde/PUGGO/inj' &&
    timestamp < 1748967296
  ) {
    return true
  }

  return false
}
