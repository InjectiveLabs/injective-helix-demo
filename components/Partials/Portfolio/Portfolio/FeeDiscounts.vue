<script lang="ts" setup>
import { Status, StatusType, BigNumberInBase } from '@injectivelabs/utils'
import { sharedToBalanceInTokenInBase } from '@shared/utils/formatter'
import {
  ONE_IN_BASE,
  UI_DEFAULT_MIN_DISPLAY_DECIMALS
} from '@/app/utils/constants'
import { MainPage } from '@/types'

const exchangeStore = useExchangeStore()
const { $onError } = useNuxtApp()

const MAKER_FEE = -0.005
const MAKER_FEE_DECIMALS = 3

const status = reactive(new Status(StatusType.Loading))

const tierLevel = computed(() =>
  new BigNumberInBase(
    exchangeStore.feeDiscountAccountInfo?.tierLevel || 0
  ).toNumber()
)

const { valueToFixed: makerFeeDiscount } = useSharedBigNumberFormatter(
  computed(() => {
    if (!exchangeStore.feeDiscountAccountInfo?.accountInfo) {
      return ''
    }

    return sharedToBalanceInTokenInBase({
      value: exchangeStore.feeDiscountAccountInfo.accountInfo.makerDiscountRate
    })
  }),
  {
    decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS
  }
)

const { valueToFixed: takerFeeDiscount } = useSharedBigNumberFormatter(
  computed(() => {
    if (!exchangeStore.feeDiscountAccountInfo?.accountInfo) {
      return ''
    }

    return sharedToBalanceInTokenInBase({
      value: exchangeStore.feeDiscountAccountInfo.accountInfo.takerDiscountRate
    })
  }),
  {
    decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS
  }
)

const { valueToFixed: discountedMakerFeeRateToFixed } =
  useSharedBigNumberFormatter(
    computed(() => {
      const makerFeeRate = new BigNumberInBase(MAKER_FEE).toFixed()
      const feeRate = new BigNumberInBase(makerFeeRate)

      return feeRate.lte(0)
        ? feeRate
        : feeRate.times(ONE_IN_BASE.minus(makerFeeDiscount.value))
    }),
    {
      decimalPlaces: MAKER_FEE_DECIMALS
    }
  )

onMounted(() => {
  status.setLoading()

  Promise.all([exchangeStore.fetchFeeDiscountAccountInfo()])
    .catch($onError)
    .finally(() => {
      status.setIdle()
    })
})
</script>

<template>
  <AppHocLoading v-bind="{ status }">
    <div class="flex flex-col rounded-lg p-4 h-full">
      <div class="flex justify-start gap-6 lg:gap-8">
        <div class="flex flex-col border-r border-coolGray-500 pr-6 lg:pr-8">
          <span class="text-coolGray-400 tracking-wide mb-2 whitespace-nowrap">
            {{ $t('feeDiscounts.my_tier') }}
          </span>
          <span
            class="lg:text-2xl font-bold tracking-normal text-blue-500 max-sm:text-xs"
          >
            #{{ tierLevel }}
          </span>
        </div>
        <div class="flex flex-col">
          <span class="text-coolGray-400 tracking-wide mb-2 whitespace-nowrap">
            {{ $t('feeDiscounts.fees_taker_maker') }}
          </span>
          <b class="max-sm:text-xs lg:text-2xl text-white tracking-normal">
            {{
              $t('feeDiscounts.fees_taker_maker_percent', {
                takerFeeDiscount,
                makerFee: discountedMakerFeeRateToFixed
              })
            }}
          </b>
          <NuxtLink
            class="text-blue-500 hover:opacity-80 hover:text-opacity-80 cursor-pointer text-xs mt-2"
            :to="{ name: MainPage.FeeDiscounts }"
          >
            {{ $t('feeDiscounts.viewFeeDiscounts') }}
          </NuxtLink>
        </div>
      </div>
    </div>
  </AppHocLoading>
</template>
