import { format } from 'date-fns'
import { BigNumberInBase } from '@injectivelabs/utils'
import { HistoricalPoints, TransformedPointsHistory } from '@/types'

export function usePointsTransformer(
  pointsHistory: ComputedRef<HistoricalPoints[]>
) {
  const appStore = useAppStore()

  const rows = computed<TransformedPointsHistory[]>(() =>
    pointsHistory.value.map((pointHistory) => {
      const dateFormat = appStore.devMode
        ? 'MMM dd, yyyy hh:mm:ss'
        : 'MMM dd, yyyy'

      return {
        points: pointHistory.points,
        volume: pointHistory.volume,
        volumeInBigNumber: new BigNumberInBase(pointHistory.volume || '0'),
        pointsInBigNumber: new BigNumberInBase(pointHistory.pointsPrecise),
        period:
          pointHistory.periodStart && pointHistory.periodEnd
            ? `${format(
                new Date(pointHistory.periodStart),
                dateFormat
              )} - ${format(new Date(pointHistory.periodEnd), dateFormat)}`
            : ''
      }
    })
  )

  return { rows }
}
