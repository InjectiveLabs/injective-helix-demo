<script lang="ts" setup>
import { DEFAULT_ASSET_DECIMALS } from '@shared/utils/constant'
import { Status, StatusType, BigNumberInBase } from '@injectivelabs/utils'
import { MainPage } from '@/types'

const exchangeStore = useExchangeStore()
const { $onError } = useNuxtApp()

const status = reactive(new Status(StatusType.Loading))

const { makerFeeRate, takerFeeRate } = useTradeFee({})

const { valueToFixed: takerFeeRateToFixed } = useSharedBigNumberFormatter(
  computed(() => takerFeeRate.value.times(100)),
  {
    decimalPlaces: DEFAULT_ASSET_DECIMALS,
    shouldTruncate: true
  }
)

const { valueToFixed: makerFeeRateToFixed } = useSharedBigNumberFormatter(
  computed(() => makerFeeRate.value.times(100)),
  {
    decimalPlaces: DEFAULT_ASSET_DECIMALS,
    shouldTruncate: true
  }
)

const tierLevel = computed(() =>
  new BigNumberInBase(
    exchangeStore.feeDiscountAccountInfo?.tierLevel || 0
  ).toNumber()
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
    <div class="flex flex-col my-8 h-full">
      <div class="flex justify-start gap-16 lg:gap-20 text-coolGray-200">
        <div class="flex flex-col gap-2">
          <span class="text-sm tracking-wide">
            {{ $t('feeDiscounts.myFeeTier') }}
          </span>
          <span class="text-3xl"> #{{ tierLevel }} </span>
        </div>

        <div class="flex flex-1 flex-col">
          <span class="text-sm tracking-wide">
            {{ $t('feeDiscounts.feesTakerMaker') }}
          </span>

          <span class="text-3xl mt-2 mb-1">
            {{
              $t('feeDiscounts.feesTakerMakerPercent', {
                takerFee: takerFeeRateToFixed,
                makerFee: makerFeeRateToFixed
              })
            }}
          </span>

          <NuxtLink
            :to="{ name: MainPage.FeeDiscounts }"
            class="text-blue-300 font-medium hover:opacity-80 transition-opacity cursor-pointer text-sm"
          >
            {{ $t('feeDiscounts.viewFeeDiscounts') }}
          </NuxtLink>
        </div>
      </div>
    </div>
  </AppHocLoading>
</template>
