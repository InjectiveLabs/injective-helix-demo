import { setActivePinia, createPinia } from 'pinia'
import { ref } from 'vue'
import { FundingPayment } from '@injectivelabs/sdk-ts'
import { describe, expect, test } from 'vitest'
import { ZERO_IN_BASE } from '@injectivelabs/sdk-ui-ts'
import { marketFactory, exchangeFactory } from '@/test/mocks'
import { useFundingPayment } from '@/composables/exchange/useFundingPayment'
import { useDerivativeStore } from '@/store/derivative'

const fundingPayment = ref<FundingPayment>(
  undefined as unknown as FundingPayment
)

describe('useFundingPayment', () => {
  setActivePinia(createPinia())

  const derivativeStore = useDerivativeStore()

  const { time, total, market, priceDecimals, quantityDecimals } =
    useFundingPayment(fundingPayment)

  describe.concurrent('time', () => {
    test('returns empty string', () => {
      fundingPayment.value = { ...exchangeFactory.injUsdtPerpFundingPayment }

      expect(time.value).toEqual('')
    })

    test('returns formattedValue', () => {
      fundingPayment.value = {
        ...exchangeFactory.injUsdtPerpFundingPayment,
        timestamp: 946684800000
      }
      derivativeStore.markets = [marketFactory.injUsdtDerivativeMarketWithToken]

      expect(time.value).toEqual('31 Dec 19:00:00')
    })
  })

  describe.concurrent('total', () => {
    describe('returns ZERO_IN_BASE', () => {
      test('fundingPayment.amount is undefined', () => {
        fundingPayment.value = { ...exchangeFactory.injUsdtPerpFundingPayment }

        expect(total.value).toEqual(ZERO_IN_BASE)
      })

      test('market is undefined', () => {
        fundingPayment.value = {
          ...exchangeFactory.injUsdtPerpFundingPayment,
          amount: '3'
        }
        derivativeStore.markets = []

        expect(total.value.toFixed()).toEqual('0')
      })
    })

    test('returns total', () => {
      derivativeStore.markets = [marketFactory.injUsdtDerivativeMarketWithToken]
      fundingPayment.value = {
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
