import { format } from 'date-fns'
import { HistoricalPoints, TransformedPointsHistory } from '@/types'

export function usePointsTransformer(
  pointsHistory: ComputedRef<HistoricalPoints[]>
) {
  const rows = computed<TransformedPointsHistory[]>(() =>
    pointsHistory.value.map((pointHistory) => ({
      points: pointHistory.points,
      volume: pointHistory.volume,
      period:
        pointHistory.periodStart && pointHistory.periodEnd
          ? `${format(
              new Date(pointHistory.periodStart),
              'MMM dd, yyyy'
            )} - ${format(new Date(pointHistory.periodEnd), 'MMM dd, yyyy')}`
          : ''
    }))
  )

  return { rows }
}
