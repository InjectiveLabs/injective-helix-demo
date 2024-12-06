import { ZERO_IN_BASE } from '@shared/utils/constant'
import { BigNumberInBase } from '@injectivelabs/utils'
import { sharedToBalanceInTokenInBase } from '@shared/utils/formatter'
import { ONE_IN_BASE } from '@/app/utils/constants'

export function useTradeFee({
  marketTakerFeeRate,
  marketMakerFeeRate
}: {
  marketTakerFeeRate?: string
  marketMakerFeeRate?: string
}) {
  const DEFAULT_TAKER_FEE = '0.0005'
  const DEFAULT_MAKER_FEE = '-0.00005'

  const takerFeeRateWithoutDiscount =
    marketTakerFeeRate || DEFAULT_TAKER_FEE.toString()
  const makerFeeRateWithoutDiscount =
    marketMakerFeeRate || DEFAULT_MAKER_FEE.toString()

  const exchangeStore = useExchangeStore()

  const makerFeeRateDiscount = computed(() => {
    if (!exchangeStore.feeDiscountAccountInfo?.accountInfo) {
      return ZERO_IN_BASE
    }

    return sharedToBalanceInTokenInBase({
      value: exchangeStore.feeDiscountAccountInfo.accountInfo.makerDiscountRate
    })
  })

  const takerFeeRateDiscount = computed(() => {
    if (!exchangeStore.feeDiscountAccountInfo?.accountInfo) {
      return ZERO_IN_BASE
    }

    return sharedToBalanceInTokenInBase({
      value: exchangeStore.feeDiscountAccountInfo.accountInfo.takerDiscountRate
    })
  })

  const makerFeeRate = computed<BigNumberInBase>(() => {
    const feeRate = new BigNumberInBase(makerFeeRateWithoutDiscount)

    return feeRate.lte(0)
      ? feeRate
      : feeRate.times(ONE_IN_BASE.minus(makerFeeRateDiscount.value))
  })

  const takerFeeRate = computed<BigNumberInBase>(() => {
    const feeRate = new BigNumberInBase(takerFeeRateWithoutDiscount)

    return feeRate.lte(0)
      ? feeRate
      : feeRate.times(ONE_IN_BASE.minus(takerFeeRateDiscount.value))
  })

  const tierLevel = computed<number>(() => {
    if (!exchangeStore.feeDiscountAccountInfo) {
      return 0
    }

    return new BigNumberInBase(
      exchangeStore.feeDiscountAccountInfo.tierLevel || 0
    ).toNumber()
  })

  return {
    tierLevel,
    makerFeeRate,
    takerFeeRate,
    makerFeeRateDiscount,
    takerFeeRateDiscount
  }
}
