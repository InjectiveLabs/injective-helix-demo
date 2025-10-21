<script setup lang="ts">
import { dataCyTag } from '@shared/utils'
import { NuxtUiIcons } from '@shared/types'
import { TradeDirection } from '@injectivelabs/ts-types'
import { DEFAULT_ASSET_DECIMALS } from '@shared/utils/constant'
import {
  Modal,
  MarketKey,
  DerivativeTradeTypes,
  PerpetualMarketCyTags,
  DerivativesTradeFormField,
  TradeAmountOption
} from '@/types'
import type { BigNumberInBase } from '@injectivelabs/utils'
import type { UiDerivativeMarket, DerivativesTradeForm } from '@/types'

const appStore = useAppStore()
const modalStore = useSharedModalStore()

withDefaults(
  defineProps<{
    enableSlippage: boolean
    margin: BigNumberInBase
    quantity: BigNumberInBase
    feeAmount: BigNumberInBase
    worstPrice: BigNumberInBase
    totalNotional: BigNumberInBase
    marginWithFee: BigNumberInBase
    estLiquidationPrice: BigNumberInBase
  }>(),
  {}
)

const derivativeMarket = inject(MarketKey) as Ref<UiDerivativeMarket>

const isOpen = ref(true)

const derivativeFormValues = useFormValues<DerivativesTradeForm>()

const isLimit = computed(
  () =>
    derivativeFormValues.value[DerivativesTradeFormField.Type] ===
    DerivativeTradeTypes.Limit
)

const slippagePercentage = computed(
  () => derivativeFormValues.value[DerivativesTradeFormField.Slippage] || 0
)

const {
  quantity: detailsQuantity,
  notional: detailsNotional,
  margin: detailsMargin,
  feeAmount: detailsFeeAmount,
  bestPrice: detailsBestPrice,
  worstPrice: detailsWorstPrice,
  averagePrice: detailsAveragePrice,
  slippagePrice: detailsSlippagePrice,
  totalNotional: detailsTotalNotional,
  marginWithFee: detailsMarginWithFee,
  enoughLiquidity: detailsEnoughLiquidity,
  slippageWarning: detailsSlippageWarning,
  calculatedNotional: detailsCalculatedNotional,
  estSlippagePercentage: detailsEstSlippagePercentage
} = useDerivativeDetails({
  market: computed(() => derivativeMarket.value),
  triggerPrice: computed(
    () =>
      derivativeFormValues.value[DerivativesTradeFormField.LimitPrice] || '0'
  ),
  leverage: computed(
    () => derivativeFormValues.value[DerivativesTradeFormField.Leverage] || '1'
  ),
  slippagePercentage: computed(
    () => derivativeFormValues.value[DerivativesTradeFormField.Slippage] || '0'
  ),
  isPostOnly: computed(
    () =>
      derivativeFormValues.value[DerivativesTradeFormField.PostOnly] || false
  ),
  isBuy: computed(
    () =>
      derivativeFormValues.value[DerivativesTradeFormField.Side] ===
      TradeDirection.Long
  ),
  isLimitOrder: computed(
    () =>
      derivativeFormValues.value[DerivativesTradeFormField.Type] ===
      DerivativeTradeTypes.Limit
  )
})

const { makerFeeRate, takerFeeRate } = useTradeFee({
  marketTakerFeeRate: derivativeMarket?.value?.takerFeeRate,
  marketMakerFeeRate: derivativeMarket?.value?.makerFeeRate
})

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

const isMakerFee = computed(
  () =>
    (derivativeFormValues.value[DerivativesTradeFormField.PostOnly] &&
      derivativeFormValues.value[DerivativesTradeFormField.Type] ===
        DerivativeTradeTypes.Limit) ||
    derivativeFormValues.value[DerivativesTradeFormField.Type] ===
      DerivativeTradeTypes.StopLimit ||
    derivativeFormValues.value[DerivativesTradeFormField.Type] ===
      DerivativeTradeTypes.StopMarket
)

watch(
  [
    () => derivativeFormValues.value[DerivativesTradeFormField.Amount],
    () => derivativeFormValues.value[DerivativesTradeFormField.AmountOption],
    () => derivativeFormValues.value[DerivativesTradeFormField.Type],
    () => derivativeFormValues.value[DerivativesTradeFormField.Side],
    () => derivativeFormValues.value[DerivativesTradeFormField.LimitPrice],
    () => derivativeFormValues.value[DerivativesTradeFormField.PostOnly]
  ],
  ([amount, amountOption]) => {
    const option = amountOption || TradeAmountOption.Base

    if (option === TradeAmountOption.Base) {
      detailsQuantity.value = amount || '0'
    } else {
      detailsNotional.value = amount || '0'
    }
  }
)

function toggle() {
  isOpen.value = !isOpen.value
}

function openSlippageModal() {
  modalStore.openModal(Modal.FuturesSlippage)
}
</script>

<template>
  <div v-if="derivativeMarket" class="mb-4">
    <div
      class="flex items-center justify-between cursor-pointer select-none text-white"
      @click="toggle"
    >
      <p class="text-xs font-semibold select-none">{{ $t('trade.details') }}</p>
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
            class="space-x-2 flex text-white"
            :data-cy="dataCyTag(PerpetualMarketCyTags.DetailsTotal)"
          >
            <span class="flex space-x-2">
              <span>&asymp;</span>

              <SharedAmount
                v-bind="{
                  useSubscript: true,
                  shouldAbbreviate: false,
                  amount: marginWithFee.toFixed()
                }"
              />
            </span>

            <span class="text-coolGray-450">
              {{ derivativeMarket.quoteToken.symbol }}
            </span>
          </p>
        </div>

        <div
          v-if="enableSlippage"
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
            </p>
            <template #panel>
              <p class="text-xs text-coolGray-200 max-w-xs p-1">
                {{ $t('trade.slippageTooltip') }}
              </p>
            </template>
          </UPopover>
        </div>

        <div class="flex items-center text-xs font-medium">
          <p class="text-coolGray-450">{{ $t('trade.margin') }}</p>
          <div class="flex-1 mx-2" />
          <p class="space-x-2">
            <SharedAmount
              :data-cy="dataCyTag(PerpetualMarketCyTags.DetailsMargin)"
              v-bind="{
                useSubscript: true,
                shouldAbbreviate: false,
                amount: margin.toFixed()
              }"
              class="text-white"
            />
            <span class="text-coolGray-450">
              {{ derivativeMarket.quoteToken.symbol }}
            </span>
          </p>
        </div>

        <div class="flex items-center text-xs font-medium">
          <p class="text-coolGray-450">{{ $t('trade.estLiquidationPrice') }}</p>
          <div class="flex-1 mx-2" />
          <p class="space-x-2 flex">
            <SharedAmount
              :data-cy="
                dataCyTag(PerpetualMarketCyTags.DetailsEstLiquidationPrice)
              "
              v-bind="{
                useSubscript: true,
                shouldAbbreviate: false,
                amount: estLiquidationPrice.toFixed(),
                decimals: derivativeMarket.priceDecimals
              }"
              class="text-white"
            />

            <span class="text-coolGray-450">
              {{ derivativeMarket.quoteToken.symbol }}
            </span>
          </p>
        </div>

        <template v-if="!isMakerFee">
          <div class="flex items-center text-xs font-medium">
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
              v-if="derivativeMarket"
              class="text-white"
              :data-cy="dataCyTag(PerpetualMarketCyTags.DetailsMakerTakerRate)"
            >
              {{ makerFeeRateToFixed }}% / {{ takerFeeRateToFixed }}%
            </p>
          </div>
        </template>

        <template v-else>
          <div class="flex items-center text-xs font-medium">
            <p class="text-coolGray-450">{{ $t('trade.makerRate') }}</p>
            <div class="flex-1 mx-2" />
            <p v-if="derivativeMarket" class="text-white">
              {{ makerFeeRateToFixed }}%
            </p>
          </div>
        </template>
      </div>

      <div v-if="appStore.devMode" class="pt-2 pb-4 space-y-1.5 text-white">
        <div class="flex justify-between items-center text-xs font-medium">
          <p class="text-yellow-600/90">Quantity</p>

          <p class="flex space-x-2">
            <SharedAmount
              v-bind="{
                amount: detailsQuantity,
                useSubscript: true,
                noTrailingZeros: false,
                shouldAbbreviate: false,
                decimals: derivativeMarket.quantityDecimals
              }"
            />
            <span class="text-coolGray-450">
              {{ derivativeMarket.baseToken.symbol }}
            </span>
          </p>
        </div>
        <div class="flex justify-between items-center text-xs font-medium">
          <p class="text-yellow-600/90">Notional</p>
          <p class="flex space-x-2">
            <SharedAmount
              v-bind="{
                amount: detailsNotional,
                useSubscript: true,
                noTrailingZeros: false,
                shouldAbbreviate: false
              }"
            />
            <span class="text-coolGray-450">
              {{ derivativeMarket.quoteToken.symbol }}
            </span>
          </p>
        </div>
        <div class="flex justify-between items-center text-xs font-medium">
          <p class="text-yellow-600/90">Calculated Notional</p>
          <p class="flex space-x-2">
            <SharedAmount
              v-bind="{
                useSubscript: true,
                noTrailingZeros: false,
                shouldAbbreviate: false,
                amount: detailsCalculatedNotional
              }"
            />
            <span class="text-coolGray-450">
              {{ derivativeMarket.quoteToken.symbol }}
            </span>
          </p>
        </div>

        <div class="flex justify-between items-center text-xs font-medium">
          <p class="text-yellow-600/90">Fee Amount</p>
          <p class="flex space-x-2">
            <SharedAmount
              v-bind="{
                amount: detailsFeeAmount,
                useSubscript: true,
                noTrailingZeros: false,
                shouldAbbreviate: false
              }"
            />
            <span class="text-coolGray-450">
              {{ derivativeMarket.quoteToken.symbol }}
            </span>
          </p>
        </div>
        <div class="flex justify-between items-center text-xs font-medium">
          <p class="text-yellow-600/90">Total Notional</p>
          <p class="flex space-x-2">
            <SharedAmount
              v-bind="{
                useSubscript: true,
                noTrailingZeros: false,
                shouldAbbreviate: false,
                amount: detailsTotalNotional
              }"
            />
            <span class="text-coolGray-450">
              {{ derivativeMarket.quoteToken.symbol }}
            </span>
          </p>
        </div>
        <div class="flex justify-between items-center text-xs font-medium">
          <p class="text-yellow-600/90">Margin</p>
          <p class="flex space-x-2">
            <SharedAmount
              v-bind="{
                useSubscript: true,
                noTrailingZeros: false,
                shouldAbbreviate: false,
                amount: detailsMargin.toFixed()
              }"
            />
            <span class="text-coolGray-450">
              {{ derivativeMarket.quoteToken.symbol }}
            </span>
          </p>
        </div>
        <div class="flex justify-between items-center text-xs font-medium">
          <p class="text-yellow-600/90">Margin with Fee</p>
          <p class="flex space-x-2">
            <SharedAmount
              v-bind="{
                useSubscript: true,
                noTrailingZeros: false,
                shouldAbbreviate: false,
                amount: detailsMarginWithFee.toFixed()
              }"
            />
            <span class="text-coolGray-450">
              {{ derivativeMarket.quoteToken.symbol }}
            </span>
          </p>
        </div>
        <template v-if="!isLimit">
          <hr class="border-white/30" />
          <div class="flex justify-between items-center text-xs font-medium">
            <p class="text-yellow-600/90">Est Slippage Percentage</p>
            <p class="text-white flex space-x-2">
              <SharedAmount
                v-bind="{
                  useSubscript: true,
                  noTrailingZeros: false,
                  shouldAbbreviate: false,
                  amount: detailsEstSlippagePercentage
                }"
              />%
              <span class="invisible">{{
                derivativeMarket.quoteToken.symbol
              }}</span>
            </p>
          </div>

          <div class="flex justify-between items-center text-xs font-medium">
            <p class="text-yellow-600/90">Slippage Tolerance</p>
            <p class="flex space-x-2">
              <SharedAmount
                v-bind="{
                  useSubscript: true,
                  noTrailingZeros: false,
                  shouldAbbreviate: false,
                  amount: slippagePercentage
                }"
              />%
              <span class="invisible">{{
                derivativeMarket.quoteToken.symbol
              }}</span>
            </p>
          </div>

          <div class="flex justify-between items-center text-xs font-medium">
            <p class="text-yellow-600/90">Slippage Price</p>
            <p class="flex space-x-2">
              <SharedAmount
                v-bind="{
                  useSubscript: true,
                  amount: detailsSlippagePrice,
                  noTrailingZeros: false,
                  shouldAbbreviate: false
                }"
              />
              <span class="text-coolGray-450">
                {{ derivativeMarket.quoteToken.symbol }}
              </span>
            </p>
          </div>
        </template>
        <hr class="border-white/30" />
        <div class="flex justify-between items-center text-xs font-medium">
          <p class="text-yellow-600/90">Worst Price</p>
          <p class="flex space-x-2">
            <SharedAmount
              v-bind="{
                useSubscript: true,
                noTrailingZeros: false,
                shouldAbbreviate: false,
                amount: detailsWorstPrice.toFixed(),
                decimals: derivativeMarket.priceDecimals
              }"
            />
            <span class="text-coolGray-450">
              {{ derivativeMarket.quoteToken.symbol }}
            </span>
          </p>
        </div>
        <div class="flex justify-between items-center text-xs font-medium">
          <p class="text-yellow-600/90">Average Price</p>
          <p class="flex space-x-2">
            <SharedAmount
              v-bind="{
                useSubscript: true,
                shouldAbbreviate: false,
                amount: detailsAveragePrice.toFixed()
              }"
            />
            <span class="text-coolGray-450">
              {{ derivativeMarket.quoteToken.symbol }}
            </span>
          </p>
        </div>
        <div class="flex justify-between items-center text-xs font-medium">
          <p class="text-yellow-600/90">Best Price</p>
          <p class="flex space-x-2">
            <SharedAmount
              v-bind="{
                useSubscript: true,
                noTrailingZeros: false,
                shouldAbbreviate: false,
                amount: detailsBestPrice.toFixed(),
                decimals: derivativeMarket.priceDecimals
              }"
            />
            <span class="text-coolGray-450">
              {{ derivativeMarket.quoteToken.symbol }}
            </span>
          </p>
        </div>
        <template v-if="!isLimit">
          <hr class="border-white/30" />
          <div class="flex justify-between items-center text-xs font-medium">
            <p class="text-yellow-600/90">Enough Liquidity</p>
            <p class="text-white">
              {{ detailsEnoughLiquidity ? 'Yes' : 'No' }}
            </p>
          </div>
          <div class="flex justify-between items-center text-xs font-medium">
            <p class="text-yellow-600/90">Slippage Warning</p>
            <p class="text-white">
              {{ detailsSlippageWarning ? 'Yes' : 'No' }}
            </p>
          </div>
        </template>
      </div>
    </AppCollapse>

    <ModalsFuturesSlippage />
  </div>
</template>
