import { setActivePinia, createPinia } from 'pinia'
import { ref } from 'vue'
import { beforeAll, describe, expect, test } from 'vitest'
import {
  FeeDiscountAccountInfo,
  FeeDiscountTierInfo
} from '@injectivelabs/sdk-ts'
import { ZERO_IN_BASE } from '@injectivelabs/sdk-ui-ts'
import { useTradeFee } from '@/composables/trading/useFees'
import { marketFactory } from '@/test/mocks'
import { UiMarketWithToken } from '@/types'
import { useExchangeStore } from '@/store/exchange'

const market = ref<UiMarketWithToken | undefined>(undefined)

describe('useTradeFee', () => {
  setActivePinia(createPinia())

  const exchangeStore = useExchangeStore()

  const {
    tierLevel,
    makerFeeRate,
    takerFeeRate,
    makerFeeRateDiscount,
    takerFeeRateDiscount
  } = useTradeFee(market)

  describe.concurrent('tierLevel', () => {
    test('returns default tierLevel', () => {
      expect(tierLevel.value).toEqual(0)
    })

    describe('returns correct tier level', () => {
      beforeAll(() => {
        exchangeStore.feeDiscountAccountInfo =
          marketFactory.feeDiscountAccountInfo
      })

      test('is base tierLevel', () => {
        expect(tierLevel.value).toEqual(0)
      })

      test('is a higher tier level', () => {
        exchangeStore.feeDiscountAccountInfo = {
          ...marketFactory.feeDiscountAccountInfo,
          tierLevel: 1
        }
        expect(tierLevel.value).toEqual(1)
      })
    })
  })

  describe.concurrent('makerFeeRateDiscount', () => {
    describe('returns ZERO_IN_BASE', () => {
      test('exchangeStore.feeDiscountAccountInfo is undefined', () => {
        expect(makerFeeRateDiscount.value).toEqual(ZERO_IN_BASE)
      })

      test('exchangeStore.feeDiscountAccountInfo.accountInfo is undefined', () => {
        exchangeStore.feeDiscountAccountInfo = {} as FeeDiscountAccountInfo

        expect(makerFeeRateDiscount.value).toEqual(ZERO_IN_BASE)
      })
    })

    describe('returns makerFeeRateDiscount', () => {
      beforeAll(() => {
        exchangeStore.feeDiscountAccountInfo =
          marketFactory.feeDiscountAccountInfo
      })

      test('makerFeeRateDiscount is makerDiscountRate', () => {
        expect(makerFeeRateDiscount.value.toString()).toEqual(
          marketFactory.feeDiscountAccountInfo.accountInfo?.makerDiscountRate
        )
      })

      test('makerDiscountRate has a non-zero value', () => {
        exchangeStore.feeDiscountAccountInfo = {
          ...marketFactory.feeDiscountAccountInfo,
          accountInfo: {
            ...marketFactory.feeDiscountAccountInfo.accountInfo,
            makerDiscountRate: '1000000000000000'
          } as FeeDiscountTierInfo
        }

        expect(makerFeeRateDiscount.value.toString()).toEqual('0.001')
      })
    })
  })

  describe.concurrent('takerFeeRateDiscount', () => {
    describe('return 0', () => {
      test('exchangeStore.feeDiscountAccountInfo is undefined', () => {
        expect(takerFeeRateDiscount.value).toEqual(ZERO_IN_BASE)
      })

      test('exchangeStore.feeDiscountAccountInfo.accountInfo is undefined', () => {
        exchangeStore.feeDiscountAccountInfo = {} as FeeDiscountAccountInfo

        expect(takerFeeRateDiscount.value).toEqual(ZERO_IN_BASE)
      })
    })

    describe('returns formatted value', () => {
      beforeAll(() => {
        exchangeStore.feeDiscountAccountInfo =
          marketFactory.feeDiscountAccountInfo
      })

      test('takerFeeRateDiscount equals takerDiscountRate', () => {
        expect(takerFeeRateDiscount.value.toString()).toEqual(
          marketFactory.feeDiscountAccountInfo.accountInfo?.takerDiscountRate
        )
      })

      test('takerDiscountRate has a non-zero value', () => {
        exchangeStore.feeDiscountAccountInfo = {
          ...marketFactory.feeDiscountAccountInfo,
          accountInfo: {
            ...marketFactory.feeDiscountAccountInfo.accountInfo,
            takerDiscountRate: '1000000000000000'
          } as FeeDiscountTierInfo
        }

        expect(takerFeeRateDiscount.value.toString()).toEqual('0.001')
      })
    })
  })

  describe.concurrent('takerFeeRate', () => {
    test('returns ZERO_IN_BASE', () => {
      expect(takerFeeRate.value).toEqual(ZERO_IN_BASE)
    })

    describe('returns takerFeeRate correctly', () => {
      test('no discount', () => {
        market.value = marketFactory.injUsdtSpotMarketWithToken
        exchangeStore.feeDiscountAccountInfo = {
          ...marketFactory.feeDiscountAccountInfo
        }

        expect(takerFeeRate.value.toString()).toEqual('0.001')
      })

      test('returns takerFeeRate subtracting discount', () => {
        market.value = marketFactory.injUsdtSpotMarketWithToken
        exchangeStore.feeDiscountAccountInfo = {
          ...marketFactory.feeDiscountAccountInfo,
          accountInfo: {
            ...marketFactory.feeDiscountAccountInfo.accountInfo,
            takerDiscountRate: '1000000000000000'
          } as FeeDiscountTierInfo
        }

        expect(takerFeeRate.value.toString()).toEqual('0.000999')
      })
    })
  })

  describe.concurrent('makerFeeRate', () => {
    test('returns ZERO_IN_BASE', () => {
      market.value = undefined
      expect(makerFeeRate.value).toEqual(ZERO_IN_BASE)
    })

    describe('returns makerFeeRate correctly', () => {
      beforeAll(() => {
        exchangeStore.feeDiscountAccountInfo =
          marketFactory.feeDiscountAccountInfo
      })

      test('no discount', () => {
        market.value = {
          ...marketFactory.injUsdtSpotMarketWithToken
        }

        expect(makerFeeRate.value.toString()).toEqual('-0.0001')
      })

      test('returns negative makerFeeRate even if discount', () => {
        market.value = marketFactory.injUsdtSpotMarketWithToken
        exchangeStore.feeDiscountAccountInfo = {
          ...marketFactory.feeDiscountAccountInfo,
          accountInfo: {
            ...marketFactory.feeDiscountAccountInfo.accountInfo,
            makerDiscountRate: '1000000000000000'
          } as FeeDiscountTierInfo
        }

        expect(makerFeeRate.value.toString()).toEqual('-0.0001')
      })

      test('returns positive makerFeeRate subtracting discount', () => {
        market.value = {
          ...marketFactory.injUsdtSpotMarketWithToken,
          makerFeeRate: '0.001'
        }

        exchangeStore.feeDiscountAccountInfo = {
          ...marketFactory.feeDiscountAccountInfo,
          accountInfo: {
            ...marketFactory.feeDiscountAccountInfo.accountInfo,
            makerDiscountRate: '1000000000000000'
          } as FeeDiscountTierInfo
        }

        expect(makerFeeRate.value.toString()).toEqual('0.000999')
      })
    })
  })
})
