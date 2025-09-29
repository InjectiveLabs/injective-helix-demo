<script setup lang="ts">
import { dataCyTag } from '@shared/utils'
import { NuxtUiIcons } from '@shared/types'
import { DEFAULT_ASSET_DECIMALS } from '@shared/utils/constant'
import {
  Modal,
  MarketKey,
  SpotTradeForm,
  SpotMarketCyTags,
  SpotTradeFormField
} from '@/types'
import type { BigNumberInBase } from '@injectivelabs/utils'

const modalStore = useSharedModalStore()

withDefaults(
  defineProps<{
    isLimit: boolean
    total: BigNumberInBase
    quantity: BigNumberInBase
    feeAmount: BigNumberInBase
    worstPrice: BigNumberInBase
    totalWithFee: BigNumberInBase
    feePercentage: BigNumberInBase
  }>(),
  {}
)
const spotMarket = inject(MarketKey)

const isOpen = ref(true)

const spotFormValues = useFormValues<SpotTradeForm>()

const { makerFeeRate, takerFeeRate } = useTradeFee({
  marketTakerFeeRate: spotMarket?.value?.takerFeeRate,
  marketMakerFeeRate: spotMarket?.value?.makerFeeRate
})

const { valueToFixed: slippagePercentage } = useSharedBigNumberFormatter(
  computed(() => spotFormValues.value[SpotTradeFormField.Slippage] || 0),
  {
    shouldTruncate: true,
    decimalPlaces: DEFAULT_ASSET_DECIMALS
  }
)

const { valueToFixed: takerFeeRateToFixed } = useSharedBigNumberFormatter(
  computed(() => takerFeeRate.value.times(100)),
  {
    shouldTruncate: true,
    decimalPlaces: DEFAULT_ASSET_DECIMALS
  }
)

const { valueToFixed: makerFeeRateToFixed } = useSharedBigNumberFormatter(
  computed(() => makerFeeRate.value.times(100)),
  {
    shouldTruncate: true,
    decimalPlaces: DEFAULT_ASSET_DECIMALS
  }
)

function toggle() {
  isOpen.value = !isOpen.value
}

function openSlippageModal() {
  modalStore.openModal(Modal.SpotSlippage)
}
</script>

<template>
  <div v-if="spotMarket" class="mb-4">
    <div
      class="flex items-center justify-between cursor-pointer select-none"
      @click="toggle"
    >
      <p class="text-xs font-semibold select-none text-white">
        {{ $t('trade.details') }}
      </p>
      <div class="transition-all" :class="{ 'rotate-180': isOpen }">
        <UIcon :name="NuxtUiIcons.ChevronDown" class="h-3 w-3 min-w-3" />
      </div>
    </div>

    <AppCollapse v-bind="{ isOpen }">
      <div class="py-4 space-y-2">
        <div class="flex items-center text-xs font-medium">
          <p class="text-coolGray-450">{{ $t('trade.total') }}</p>
          <div class="flex-1 mx-2" />

          <p
            class="flex space-x-2 text-white"
            :data-cy="dataCyTag(SpotMarketCyTags.DetailsTotal)"
          >
            <span class="flex space-x-2">
              <span>&asymp;</span>
              <SharedAmount
                v-bind="{
                  useSubscript: true,
                  shouldAbbreviate: false,
                  amount: totalWithFee.toFixed()
                }"
              />
            </span>

            <span class="text-coolGray-450">
              {{ spotMarket.quoteToken.symbol }}
            </span>
          </p>
        </div>

        <div
          v-if="!isLimit"
          class="flex justify-between items-center text-xs font-medium"
        >
          <p class="text-coolGray-450" @click="openSlippageModal">
            {{ $t('trade.slippage') }}
          </p>

          <UPopover
            mode="hover"
            :popper="{ placement: 'top', strategy: 'fixed' }"
          >
            <p class="text-blue-550 cursor-pointer" @click="openSlippageModal">
              <i18n-t
                keypath="trade.slippageEstimate"
                class="text-xs text-coolGray-400"
              >
                <template #max>
                  <SharedAmount
                    v-bind="{
                      useSubscript: true,
                      shouldAbbreviate: false,
                      amount: slippagePercentage
                    }"
                  />
                </template>
              </i18n-t>
            </p>
            <template #panel>
              <p class="text-xs text-coolGray-200 max-w-xs p-1">
                {{ $t('trade.slippageTooltip') }}
              </p>
            </template>
          </UPopover>
        </div>

        <div v-if="!isLimit" class="flex items-center text-xs font-medium">
          <CommonHeaderTooltip
            :tooltip="
              $t('trade.makerTakerRateTooltip', {
                makerFeeRate: makerFeeRateToFixed,
                takerFeeRate: takerFeeRateToFixed
              })
            "
          >
            <p class="text-coolGray-450">{{ $t('trade.makerTakerRate') }}</p>
          </CommonHeaderTooltip>
          <div class="flex-1 mx-2" />
          <p
            v-if="spotMarket"
            class="text-white"
            :data-cy="dataCyTag(SpotMarketCyTags.DetailsMakerTakerRate)"
          >
            {{ makerFeeRateToFixed }}% / {{ takerFeeRateToFixed }}%
          </p>
        </div>

        <template v-else>
          <div class="flex items-center text-xs font-medium">
            <p class="text-coolGray-450">{{ $t('trade.makerRate') }}</p>
            <div class="flex-1 mx-2" />
            <p
              v-if="spotMarket"
              class="text-white"
              :data-cy="dataCyTag(SpotMarketCyTags.DetailsMakerFeeRate)"
            >
              {{ makerFeeRateToFixed }}%
            </p>
          </div>
        </template>
      </div>
    </AppCollapse>

    <ModalsSpotSlippage />
  </div>
</template>
