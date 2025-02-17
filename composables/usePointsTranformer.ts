import { BigNumberInBase } from '@injectivelabs/utils'
import { format, startOfISOWeek, addDays, addWeeks } from 'date-fns'
import { HistoricalPoints, TransformedPointsHistory } from '@/types'

const DATE_FORMAT = 'MMM dd, yyyy'

function getISOWeekPeriod(isoWeekString: string) {
  const [year, week] = isoWeekString.split('-W').map(Number)

  const weekIndex = week - 1
  const weekStartDate = addWeeks(
    startOfISOWeek(new Date(year, 0, 1)),
    weekIndex
  )

  const weekEndDate = addDays(weekStartDate, 6)

  const formattedStartDate = format(weekStartDate, DATE_FORMAT)
  const formattedEndDate = format(weekEndDate, DATE_FORMAT)

  return `${formattedStartDate} - ${formattedEndDate}`
}

export function usePointsTransformer(
  isDailyPeriod: ComputedRef<boolean>,
  pointsHistory: ComputedRef<HistoricalPoints[]>
) {
  const rows = computed<TransformedPointsHistory[]>(() => {
    return pointsHistory.value.map((pointHistory) => {
      return {
        points: pointHistory.points,
        volume: pointHistory.volume,
        volumeInBigNumber: new BigNumberInBase(pointHistory.volume || '0'),
        pointsInBigNumber: new BigNumberInBase(pointHistory.pointsPrecise),
        period: isDailyPeriod.value
          ? format(new Date(pointHistory.day), DATE_FORMAT)
          : getISOWeekPeriod(pointHistory.week)
      }
    })
  })

  return { rows }
}
