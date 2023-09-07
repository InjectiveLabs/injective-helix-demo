import { format, intervalToDuration } from 'date-fns'
import { UseActiveGridStrategyType } from '@/composables/grid-trading/useActiveGridStrategy'

export default function useActiveGridStrategyFormatter(
  props: UseActiveGridStrategyType
) {
  const {
    pnl,
    createdAt,
    now,
    upperBound,
    lowerBound,
    investment,
    creationExecutionPrice
  } = props

  const createdAtFormatted = computed(() =>
    format(new Date(Number(createdAt.value)), 'dd MMM HH:mm:ss')
  )

  const durationFormatted = computed(() => {
    const { days, hours, minutes } = intervalToDuration({
      start: new Date(Number(createdAt.value)),
      end: new Date(now.value)
    })

    return `${days}D ${hours}H ${minutes}M`
  })

  const { valueToString: upperBoundtoString } = useBigNumberFormatter(
    upperBound,
    { decimalPlaces: 2 }
  )

  const { valueToString: lowerBoundtoString } = useBigNumberFormatter(
    lowerBound,
    { decimalPlaces: 2 }
  )

  const { valueToString: pnltoString } = useBigNumberFormatter(pnl, {
    decimalPlaces: 2
  })

  const { valueToString: investmentToString } = useBigNumberFormatter(
    investment,
    { decimalPlaces: 2 }
  )

  const { valueToString: creationExecutionPriceToString } =
    useBigNumberFormatter(creationExecutionPrice, { decimalPlaces: 2 })

  return {
    pnltoString,
    durationFormatted,
    createdAtFormatted,
    upperBoundtoString,
    lowerBoundtoString,
    investmentToString,
    creationExecutionPriceToString
  }
}
