import { BigNumberInBase } from '@injectivelabs/utils'
import { intervalToDuration } from 'date-fns'

export const todayInSeconds = (): number => {
  return Math.floor(Date.now() / 1000)
}

export const sharedGetDuration = ({
  endDateInMilliseconds,
  nowInMilliseconds
}: {
  endDateInMilliseconds: string
  nowInMilliseconds: string
}) => {
  const end = new BigNumberInBase(endDateInMilliseconds)
  const now = new BigNumberInBase(nowInMilliseconds)

  const startInMilliseconds = now.isGreaterThan(end) ? end : now

  const duration = intervalToDuration({
    start: startInMilliseconds.toNumber(),
    end: end.toNumber()
  })

  return duration
}
