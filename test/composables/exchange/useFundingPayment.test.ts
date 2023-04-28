import { setActivePinia, createPinia } from 'pinia'
import { ref } from 'vue'
import { FundingPayment } from '@injectivelabs/sdk-ts'
import { beforeAll, describe, expect, test } from 'vitest'
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
    describe('fail validation return empty string', () => {
      test('if fundingPayment.timestamp is undefined', () => {
        fundingPayment.value = { ...exchangeFactory.injUsdtPerpFundingPayment }

        expect(time.value).toEqual('')
      })
    })

    describe('passes validation', () => {
      test('time is formatted', () => {
        fundingPayment.value = {
          ...exchangeFactory.injUsdtPerpFundingPayment,
          timestamp: 946684800000
        }
        derivativeStore.markets = [
          marketFactory.injUsdtDerivativeMarketWithToken
        ]

        expect(time.value).toEqual('31 Dec 18:00:00')
      })
    })
  })

  describe.concurrent('total', () => {
    describe('fail validation return 0', () => {
      test('if fundingPayment.amount is undefined', () => {
        fundingPayment.value = { ...exchangeFactory.injUsdtPerpFundingPayment }

        expect(total.value).toEqual(ZERO_IN_BASE)
      })

      test('if market is undefined return 0', () => {
        fundingPayment.value = {
          ...exchangeFactory.injUsdtPerpFundingPayment,
          amount: '3'
        }
        derivativeStore.markets = []

        expect(total.value.toFixed()).toEqual('0')
      })
    })

    describe('passes validation', () => {
      beforeAll(() => {
        derivativeStore.markets = [
          marketFactory.injUsdtDerivativeMarketWithToken
        ]
      })

      test('total is 3', () => {
        fundingPayment.value = {
          ...exchangeFactory.injUsdtPerpFundingPayment,
          amount: '3000000'
        }

        expect(total.value.toFixed()).toEqual('3')
      })
    })
  })

  describe.concurrent('quantityDecimals', () => {
    describe('fail validation return 0', () => {
      test('if market is undefined return default decimals 4', () => {
        derivativeStore.markets = []
        expect(quantityDecimals.value).toEqual(4)
      })
    })

    describe('passes validation', () => {
      test('quantity decimals is 3', () => {
        derivativeStore.markets = [
          marketFactory.injUsdtDerivativeMarketWithToken
        ]
        expect(quantityDecimals.value).toEqual(3)
      })
    })
  })

  describe.concurrent('priceDecimals', () => {
    describe('fail validation return 0', () => {
      test('if market is undefined return default decimals 4', () => {
        derivativeStore.markets = []

        expect(priceDecimals.value).toEqual(4)
      })
    })

    describe('passes validation', () => {
      test('price decimals is 3', () => {
        derivativeStore.markets = [
          marketFactory.injUsdtDerivativeMarketWithToken
        ]

        expect(priceDecimals.value).toEqual(3)
      })
    })
  })

  describe.concurrent('market', () => {
    describe('fail validation return undefined', () => {
      test('if derivativeStore.markets is empty array return undefined', () => {
        derivativeStore.markets = []

        expect(market.value).toEqual(undefined)
      })
    })

    describe('passes validation', () => {
      test('market is injUsdtPerp market', () => {
        derivativeStore.markets = [
          marketFactory.injUsdtDerivativeMarketWithToken
        ]

        expect(market.value).toEqual(
          marketFactory.injUsdtDerivativeMarketWithToken
        )
      })
    })
  })
})
