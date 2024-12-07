import { describe, expect, test } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { ZERO_IN_BASE } from '@shared/utils/constant'
import { FundingPayment } from '@injectivelabs/sdk-ts'
import { marketFactory, exchangeFactory } from '@/test/mocks'
import { useFundingHistory } from '@/composables/exchange/useFundingHistory'
import { useDerivativeStore } from '@/store/derivative'

const fundingHistory = ref<FundingPayment>(
  undefined as unknown as FundingPayment
)

describe('useFundingHistory', () => {
  setActivePinia(createPinia())

  const derivativeStore = useDerivativeStore()

  const { time, total, market, priceDecimals, quantityDecimals } =
    useFundingHistory(fundingHistory)

  describe.concurrent('time', () => {
    test('returns empty string', () => {
      fundingHistory.value = { ...exchangeFactory.injUsdtPerpFundingPayment }

      expect(time.value).toEqual('')
    })

    test('returns formattedValue', () => {
      fundingHistory.value = {
        ...exchangeFactory.injUsdtPerpFundingPayment,
        timestamp: 946684800000
      }
      derivativeStore.markets = [marketFactory.injUsdtDerivativeMarketWithToken]

      expect(time.value).toEqual('31 Dec 19:00:00')
    })
  })

  describe.concurrent('total', () => {
    describe('returns ZERO_IN_BASE', () => {
      test('fundingHistory.amount is undefined', () => {
        fundingHistory.value = { ...exchangeFactory.injUsdtPerpFundingPayment }

        expect(total.value).toEqual(ZERO_IN_BASE)
      })

      test('market is undefined', () => {
        fundingHistory.value = {
          ...exchangeFactory.injUsdtPerpFundingPayment,
          amount: '3'
        }
        derivativeStore.markets = []

        expect(total.value.toFixed()).toEqual('0')
      })
    })

    test('returns total', () => {
      derivativeStore.markets = [marketFactory.injUsdtDerivativeMarketWithToken]
      fundingHistory.value = {
        ...exchangeFactory.injUsdtPerpFundingPayment,
        amount: '3000000'
      }

      expect(total.value.toFixed()).toEqual('3')
    })
  })

  describe.concurrent('quantityDecimals', () => {
    test('returns default decimals', () => {
      derivativeStore.markets = []
      expect(quantityDecimals.value).toEqual(4)
    })

    test('returns formatted value', () => {
      derivativeStore.markets = [marketFactory.injUsdtDerivativeMarketWithToken]
      expect(quantityDecimals.value).toEqual(3)
    })
  })

  describe.concurrent('priceDecimals', () => {
    test('returns default decimals', () => {
      derivativeStore.markets = []

      expect(priceDecimals.value).toEqual(4)
    })

    test('returns formatted value', () => {
      derivativeStore.markets = [marketFactory.injUsdtDerivativeMarketWithToken]

      expect(priceDecimals.value).toEqual(3)
    })
  })

  describe.concurrent('market', () => {
    test('returns no market', () => {
      derivativeStore.markets = []

      expect(market.value).toEqual(undefined)
    })

    test('returns correct market', () => {
      derivativeStore.markets = [marketFactory.injUsdtDerivativeMarketWithToken]

      expect(market.value).toEqual(
        marketFactory.injUsdtDerivativeMarketWithToken
      )
    })
  })
})
