import { format } from 'date-fns'
import { BigNumberInBase } from '@injectivelabs/utils'
import { HistoricalPoints, TransformedPointsHistory } from '@/types'

export function usePointsTransformer(
  pointsHistory: ComputedRef<HistoricalPoints[]>
) {
  const rows = computed<TransformedPointsHistory[]>(() =>
    pointsHistory.value.map((pointHistory) => {
      return {
        points: pointHistory.points,
        volume: pointHistory.volume,
        volumeInBigNumber: new BigNumberInBase(pointHistory.volume || '0'),
        pointsInBigNumber: new BigNumberInBase(pointHistory.pointsPrecise),
        period:
          pointHistory.periodStart && pointHistory.periodEnd
            ? `${format(
                new Date(pointHistory.periodStart),
                'MMM dd, yyyy'
              )} - ${format(new Date(pointHistory.periodEnd), 'MMM dd, yyyy')}`
            : ''
      }
    })
  )

  return { rows }
}
