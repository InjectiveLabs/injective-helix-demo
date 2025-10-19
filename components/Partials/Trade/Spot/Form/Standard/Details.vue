<script setup lang="ts">
import { dataCyTag } from '@shared/utils'
import { NuxtUiIcons } from '@shared/types'
import { DEFAULT_ASSET_DECIMALS } from '@shared/utils/constant'
import {
  Modal,
  MarketKey,
  UiSpotMarket,
  SpotTradeForm,
  SpotMarketCyTags,
  SpotTradeFormField,
  TradeAmountOption,
  TradeTypes
} from '@/types'
import { OrderSide } from '@injectivelabs/ts-types'

const appStore = useAppStore()
const modalStore = useSharedModalStore()

const spotMarket = inject(MarketKey) as ComputedRef<UiSpotMarket>

const isOpen = ref(true)

const spotFormValues = useFormValues<SpotTradeForm>()

const { makerFeeRate, takerFeeRate } = useTradeFee({
  marketTakerFeeRate: spotMarket?.value?.takerFeeRate,
  marketMakerFeeRate: spotMarket?.value?.makerFeeRate
})

const isLimit = computed(
  () => spotFormValues.value[SpotTradeFormField.Type] === TradeTypes.Limit
)

const {
  quantity,
  notional,
  calculatedNotional,
  feeAmount,
  slippagePrice,
  totalNotional,
  averagePrice,
  bestPrice,
  worstPrice,
  enoughLiquidity,
  estSlippagePercentage,
  slippageWarning
} = useSpotDetails({
  market: computed(() => spotMarket.value),
  slippagePercentage: computed(
    () => spotFormValues.value[SpotTradeFormField.Slippage] || '0'
  ),
  isBuy: computed(
    () => spotFormValues.value[SpotTradeFormField.Side] === OrderSide.Buy
  )
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

watch(
  [
    () => spotFormValues.value[SpotTradeFormField.Amount],
    () => spotFormValues.value[SpotTradeFormField.AmountOption],
    () => spotFormValues.value[SpotTradeFormField.Type],
    () => spotFormValues.value[SpotTradeFormField.Side]
  ],
  ([amount, amountOption]) => {
    const option = amountOption || TradeAmountOption.Base

    if (option === TradeAmountOption.Base) {
      quantity.value = amount || '0'
    } else {
      notional.value = amount || '0'
    }
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
        <div class="flex justify-between items-center text-xs font-medium">
          <p class="text-coolGray-450">{{ $t('trade.total') }}</p>

          <p
            class="flex space-x-2 text-white"
            :data-cy="dataCyTag(SpotMarketCyTags.DetailsTotal)"
          >
            <span class="flex space-x-2">
              <span>&asymp;</span>
              <SharedAmount
                v-bind="{
                  useSubscript: true,
                  amount: totalNotional,
                  shouldAbbreviate: false
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
              <span v-if="enoughLiquidity">
                <i18n-t
                  keypath="trade.estSlippage"
                  class="text-xs text-coolGray-400 mx-1"
                >
                  <template #estSlippage>
                    <SharedAmount
                      v-bind="{
                        useSubscript: true,
                        shouldAbbreviate: false,
                        amount: estSlippagePercentage
                      }"
                    />
                  </template>
                </i18n-t>
                /
              </span>
              <span>
                <i18n-t
                  keypath="trade.maxSlippage"
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
              </span>
            </p>
            <template #panel>
              <p class="text-xs text-coolGray-200 max-w-xs p-1">
                {{ $t('trade.slippageTooltip') }}
              </p>
            </template>
          </UPopover>
        </div>

        <div
          v-if="!isLimit"
          class="flex justify-between items-center text-xs font-medium"
        >
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
          <p
            v-if="spotMarket"
            class="text-white"
            :data-cy="dataCyTag(SpotMarketCyTags.DetailsMakerTakerRate)"
          >
            {{ makerFeeRateToFixed }}% / {{ takerFeeRateToFixed }}%
          </p>
        </div>

        <div
          v-else
          class="flex justify-between items-center text-xs font-medium"
        >
          <p class="text-coolGray-450">{{ $t('trade.makerRate') }}</p>
          <p
            v-if="spotMarket"
            class="text-white"
            :data-cy="dataCyTag(SpotMarketCyTags.DetailsMakerFeeRate)"
          >
            {{ makerFeeRateToFixed }}%
          </p>
        </div>
      </div>

      <div v-if="appStore.devMode" class="pt-2 pb-4 space-y-1.5 text-white">
        <div class="flex justify-between items-center text-xs font-medium">
          <p class="text-yellow-600/90">Quantity</p>

          <p class="flex space-x-2">
            <SharedAmount
              v-bind="{
                amount: quantity,
                useSubscript: true,
                noTrailingZeros: false,
                shouldAbbreviate: false
              }"
            />
            <span class="text-coolGray-450">
              {{ spotMarket.baseToken.symbol }}
            </span>
          </p>
        </div>
        <div class="flex justify-between items-center text-xs font-medium">
          <p class="text-yellow-600/90">Notional</p>
          <p class="flex space-x-2">
            <SharedAmount
              v-bind="{
                amount: notional,
                useSubscript: true,
                noTrailingZeros: false,
                shouldAbbreviate: false
              }"
            />
            <span class="text-coolGray-450">
              {{ spotMarket.quoteToken.symbol }}
            </span>
          </p>
        </div>
        <div class="flex justify-between items-center text-xs font-medium">
          <p class="text-yellow-600/90">Calculated Notional</p>
          <p class="flex space-x-2">
            <SharedAmount
              v-bind="{
                amount: calculatedNotional,
                useSubscript: true,
                noTrailingZeros: false,
                shouldAbbreviate: false
              }"
            />
            <span class="text-coolGray-450">
              {{ spotMarket.quoteToken.symbol }}
            </span>
          </p>
        </div>

        <div class="flex justify-between items-center text-xs font-medium">
          <p class="text-yellow-600/90">Fee Amount</p>
          <p class="flex space-x-2">
            <SharedAmount
              v-bind="{
                amount: feeAmount,
                useSubscript: true,
                noTrailingZeros: false,
                shouldAbbreviate: false
              }"
            />
            <span class="text-coolGray-450">
              {{ spotMarket.quoteToken.symbol }}
            </span>
          </p>
        </div>

        <div class="flex justify-between items-center text-xs font-medium">
          <p class="text-yellow-600/90">Slippage Price</p>
          <p class="flex space-x-2">
            <SharedAmount
              v-bind="{
                amount: slippagePrice,
                useSubscript: true,
                noTrailingZeros: false,
                shouldAbbreviate: false
              }"
            />
            <span class="text-coolGray-450">
              {{ spotMarket.quoteToken.symbol }}
            </span>
          </p>
        </div>
        <hr class="border-white/30" />
        <div class="flex justify-between items-center text-xs font-medium">
          <p class="text-yellow-600/90">Worst Price</p>
          <p class="flex space-x-2">
            <SharedAmount
              v-bind="{
                amount: worstPrice.toFixed(),
                useSubscript: true,
                noTrailingZeros: false,
                shouldAbbreviate: false
              }"
            />
            <span class="text-coolGray-450">
              {{ spotMarket.quoteToken.symbol }}
            </span>
          </p>
        </div>
        <div class="flex justify-between items-center text-xs font-medium">
          <p class="text-yellow-600/90">Average Price</p>
          <p class="flex space-x-2">
            <SharedAmount
              v-bind="{
                amount: averagePrice.toFixed(),
                useSubscript: true,
                noTrailingZeros: false,
                shouldAbbreviate: false
              }"
            />
            <span class="text-coolGray-450">
              {{ spotMarket.quoteToken.symbol }}
            </span>
          </p>
        </div>
        <div class="flex justify-between items-center text-xs font-medium">
          <p class="text-yellow-600/90">Best Price</p>
          <p class="flex space-x-2">
            <SharedAmount
              v-bind="{
                amount: bestPrice.toFixed(),
                useSubscript: true,
                noTrailingZeros: false,
                shouldAbbreviate: false
              }"
            />
            <span class="text-coolGray-450">
              {{ spotMarket.quoteToken.symbol }}
            </span>
          </p>
        </div>
        <hr class="border-white/30" />
        <div class="flex justify-between items-center text-xs font-medium">
          <p class="text-yellow-600/90">Enough Liquidity</p>
          <p class="text-white">
            {{ enoughLiquidity ? 'Yes' : 'No' }}
          </p>
        </div>
        <div class="flex justify-between items-center text-xs font-medium">
          <p class="text-yellow-600/90">Slippage Warning</p>
          <p class="text-white">
            {{ slippageWarning ? 'Yes' : 'No' }}
          </p>
        </div>
        <div class="flex justify-between items-center text-xs font-medium">
          <p class="text-yellow-600/90">Est Slippage Percentage</p>
          <p class="text-white">{{ estSlippagePercentage }} %</p>
        </div>
      </div>
    </AppCollapse>

    <ModalsSpotSlippage />
  </div>
</template>
