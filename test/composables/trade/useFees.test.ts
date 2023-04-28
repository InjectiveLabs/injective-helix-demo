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
    describe('fail validation return 0', () => {
      test('if exchangeStore.feeDiscountAccountInfo fails validation', () => {
        expect(tierLevel.value).toEqual(0)
      })
    })

    describe('passes validation', () => {
      beforeAll(() => {
        exchangeStore.feeDiscountAccountInfo =
          marketFactory.feeDiscountAccountInfo
      })

      test('tierLevel is 0', () => {
        expect(tierLevel.value).toEqual(0)
      })

      test('tierLevel is 1', () => {
        exchangeStore.feeDiscountAccountInfo = {
          ...marketFactory.feeDiscountAccountInfo,
          tierLevel: 1
        }
        expect(tierLevel.value).toEqual(1)
      })
    })
  })

  describe.concurrent('makerFeeRateDiscount', () => {
    describe('fail validation return 0', () => {
      test('if exchangeStore.feeDiscountAccountInfo validation fail', () => {
        expect(makerFeeRateDiscount.value).toEqual(ZERO_IN_BASE)
      })

      test('if exchangeStore.feeDiscountAccountInfo.accountInfo validation fail', () => {
        exchangeStore.feeDiscountAccountInfo = {} as FeeDiscountAccountInfo

        expect(makerFeeRateDiscount.value).toEqual(ZERO_IN_BASE)
      })
    })

    describe('passes validation', () => {
      beforeAll(() => {
        exchangeStore.feeDiscountAccountInfo =
          marketFactory.feeDiscountAccountInfo
      })

      describe('discount is 0', () => {
        test('returns market makerFeeRateDiscount is 0', () => {
          expect(makerFeeRateDiscount.value.toString()).toEqual(
            marketFactory.feeDiscountAccountInfo.accountInfo?.makerDiscountRate
          )
        })

        test('returns market makerFeeRateDiscount is 0.001 ', () => {
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
  })

  describe.concurrent('takerFeeRateDiscount', () => {
    describe('fail validation return 0', () => {
      test('if exchangeStore.feeDiscountAccountInfo validation fail', () => {
        expect(takerFeeRateDiscount.value).toEqual(ZERO_IN_BASE)
      })

      test('if exchangeStore.feeDiscountAccountInfo.accountInfo validation fail', () => {
        exchangeStore.feeDiscountAccountInfo = {} as FeeDiscountAccountInfo

        expect(takerFeeRateDiscount.value).toEqual(ZERO_IN_BASE)
      })
    })

    describe('passes validation', () => {
      beforeAll(() => {
        exchangeStore.feeDiscountAccountInfo =
          marketFactory.feeDiscountAccountInfo
      })

      describe('discount is 0', () => {
        test('returns market takerFeeRateDiscount is 0', () => {
          expect(takerFeeRateDiscount.value.toString()).toEqual(
            marketFactory.feeDiscountAccountInfo.accountInfo?.takerDiscountRate
          )
        })

        test('returns market takerFeeRateDiscount is 0.001 ', () => {
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
  })

  describe.concurrent('takerFeeRate', () => {
    describe('fail validation return 0', () => {
      test('if market validation fail', () => {
        expect(takerFeeRate.value).toEqual(ZERO_IN_BASE)
      })
    })

    describe('passes validation', () => {
      beforeAll(() => {
        exchangeStore.feeDiscountAccountInfo =
          marketFactory.feeDiscountAccountInfo
      })

      describe('discount is 0', () => {
        test('returns market takerFeeRate if discount is 0', () => {
          market.value = {
            ...marketFactory.injUsdtSpotMarketWithToken
          }

          expect(takerFeeRate.value.toString()).toEqual('0.001')
        })
      })

      describe('discount is 0.001', () => {
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
  })

  describe.concurrent('makerFeeRate', () => {
    describe('fail validation return 0', () => {
      test('if market validation fail', () => {
        test('if market validation fail', () => {
          expect(makerFeeRate.value).toEqual(ZERO_IN_BASE)
        })
      })
    })

    describe('passes validation', () => {
      beforeAll(() => {
        exchangeStore.feeDiscountAccountInfo =
          marketFactory.feeDiscountAccountInfo
      })

      describe('discount is 0', () => {
        test('returns market takerFeeRate if discount is 0', () => {
          market.value = {
            ...marketFactory.injUsdtSpotMarketWithToken
          }

          expect(makerFeeRate.value.toString()).toEqual('-0.0001')
        })
      })

      describe('discount is 0.001', () => {
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
      })

      describe('discount is 0.000999', () => {
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
})
