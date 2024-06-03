import { ZERO_IN_BASE } from '@shared/utils/constant'
import { BigNumberInBase } from '@injectivelabs/utils'
import { cosmosSdkDecToBigNumber } from '@injectivelabs/sdk-ts'
import { ONE_IN_BASE } from '@/app/utils/constants'
import { UiMarketWithToken } from '@/types'

export function useTradeFee(market: Ref<UiMarketWithToken | undefined>) {
  const exchangeStore = useExchangeStore()

  const makerFeeRateDiscount = computed(() => {
    if (
      !exchangeStore.feeDiscountAccountInfo ||
      !exchangeStore.feeDiscountAccountInfo.accountInfo
    ) {
      return ZERO_IN_BASE
    }

    const discount = cosmosSdkDecToBigNumber(
      exchangeStore.feeDiscountAccountInfo.accountInfo.makerDiscountRate
    )

    return new BigNumberInBase(discount)
  })

  const takerFeeRateDiscount = computed(() => {
    if (
      !exchangeStore.feeDiscountAccountInfo ||
      !exchangeStore.feeDiscountAccountInfo.accountInfo
    ) {
      return ZERO_IN_BASE
    }

    const discount = cosmosSdkDecToBigNumber(
      exchangeStore.feeDiscountAccountInfo.accountInfo.takerDiscountRate
    )

    return new BigNumberInBase(discount)
  })

  const makerFeeRate = computed<BigNumberInBase>(() => {
    if (!market.value) {
      return ZERO_IN_BASE
    }

    const feeRate = new BigNumberInBase(market.value.makerFeeRate)

    return feeRate.lte(0)
      ? feeRate
      : feeRate.times(ONE_IN_BASE.minus(makerFeeRateDiscount.value))
  })

  const takerFeeRate = computed<BigNumberInBase>(() => {
    if (!market.value) {
      return ZERO_IN_BASE
    }

    const feeRate = new BigNumberInBase(market.value.takerFeeRate)

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
