<script setup lang="ts">
import { dataCyTag } from '@shared/utils'
import { NuxtUiIcons } from '@shared/types'
import { DEFAULT_ASSET_DECIMALS } from '@shared/utils/constant'
import {
  Modal,
  MarketKey,
  DerivativeTradeTypes,
  PerpetualMarketCyTags,
  DerivativesTradeFormField
} from '@/types'
import type { BigNumberInBase } from '@injectivelabs/utils'
import type {
  DerivativeDetails,
  UiDerivativeMarket,
  DerivativesTradeForm
} from '@/types'
import {
  UI_ZERO_DECIMAL,
  MIN_EST_SLIPPAGE,
  DEFAULT_EST_SLIPPAGE,
  UI_DEFAULT_DISPLAY_DECIMALS
} from '@/app/utils/constants'

const appStore = useAppStore()
const modalStore = useSharedModalStore()

const props = withDefaults(
  defineProps<{
    details: DerivativeDetails
    estLiquidationPrice: BigNumberInBase
  }>(),
  {}
)

const derivativeMarket = inject(MarketKey) as Ref<UiDerivativeMarket>

const isOpen = ref(true)

const derivativeFormValues = useFormValues<DerivativesTradeForm>()

const enableSlippage = computed(() =>
  [DerivativeTradeTypes.Market, DerivativeTradeTypes.StopMarket].includes(
    derivativeFormValues.value[
      DerivativesTradeFormField.Type
    ] as DerivativeTradeTypes
  )
)

const isLimit = computed(
  () =>
    derivativeFormValues.value[DerivativesTradeFormField.Type] ===
      DerivativeTradeTypes.Limit ||
    derivativeFormValues.value[DerivativesTradeFormField.Type] ===
      DerivativeTradeTypes.StopLimit
)

const slippagePercentage = computed(
  () => derivativeFormValues.value[DerivativesTradeFormField.Slippage] || 0
)

const isTriggerOrder = computed(() =>
  [DerivativeTradeTypes.StopLimit, DerivativeTradeTypes.StopMarket].includes(
    derivativeFormValues.value[
      DerivativesTradeFormField.Type
    ] as DerivativeTradeTypes
  )
)

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

const formAmount = computed(
  () => derivativeFormValues.value[DerivativesTradeFormField.Amount] || '0'
)

const adaptedEstSlippagePercentage = computed(() => {
  if (formAmount.value === '0') {
    return DEFAULT_EST_SLIPPAGE
  }

  if (props.details.estSlippagePercentage.value.lt(0.0005)) {
    return MIN_EST_SLIPPAGE
  }

  return props.details.estSlippagePercentage.value
})

const estSlippageDecimals = computed(() => {
  if (formAmount.value === '0') {
    return UI_ZERO_DECIMAL
  }

  return UI_DEFAULT_DISPLAY_DECIMALS
})

const showEstSlippage = computed(
  () => props.details.enoughLiquidity.value && !isTriggerOrder.value
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
                  amount: details.marginWithFee.value.toFixed()
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
              <span v-if="showEstSlippage">
                <i18n-t
                  keypath="trade.estSlippage"
                  class="text-xs text-coolGray-400 mx-1"
                >
                  <template #estSlippage>
                    <SharedAmount
                      v-bind="{
                        noTrailingZeros: false,
                        shouldAbbreviate: false,
                        decimals: estSlippageDecimals,
                        amount: adaptedEstSlippagePercentage
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

        <div class="flex items-center text-xs font-medium">
          <p class="text-coolGray-450">{{ $t('trade.margin') }}</p>
          <div class="flex-1 mx-2" />
          <p class="space-x-2">
            <SharedAmount
              :data-cy="dataCyTag(PerpetualMarketCyTags.DetailsMargin)"
              v-bind="{
                useSubscript: true,
                shouldAbbreviate: false,
                amount: details.margin.value.toFixed()
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
          <CommonHeaderTooltip tooltip="The amount of contracts you're trading">
            <p class="text-yellow-600/90">Quantity</p>
          </CommonHeaderTooltip>

          <p class="flex space-x-2">
            <SharedAmount
              v-bind="{
                amount: details.quantity.value,
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
          <CommonHeaderTooltip
            tooltip="The notional value of your position in the quote asset"
          >
            <p class="text-yellow-600/90">Notional</p>
          </CommonHeaderTooltip>
          <p class="flex space-x-2">
            <SharedAmount
              v-bind="{
                amount: details.notional.value,
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
          <CommonHeaderTooltip
            tooltip="The notional value adjusted for estimated execution price and quantized quantity"
          >
            <p class="text-yellow-600/90">Calculated Notional</p>
          </CommonHeaderTooltip>
          <p class="flex space-x-2">
            <SharedAmount
              v-bind="{
                useSubscript: true,
                noTrailingZeros: false,
                shouldAbbreviate: false,
                amount: details.calculatedNotional.value
              }"
            />
            <span class="text-coolGray-450">
              {{ derivativeMarket.quoteToken.symbol }}
            </span>
          </p>
        </div>

        <div class="flex justify-between items-center text-xs font-medium">
          <CommonHeaderTooltip tooltip="The trading fee charged for this order">
            <p class="text-yellow-600/90">Fee Amount</p>
          </CommonHeaderTooltip>
          <p class="flex space-x-2">
            <SharedAmount
              v-bind="{
                amount: details.feeAmount.value,
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
          <CommonHeaderTooltip
            tooltip="The total notional value of your position (calculated notional + fees)"
          >
            <p class="text-yellow-600/90">Total Notional</p>
          </CommonHeaderTooltip>
          <p class="flex space-x-2">
            <SharedAmount
              v-bind="{
                useSubscript: true,
                noTrailingZeros: false,
                shouldAbbreviate: false,
                amount: details.totalNotional.value
              }"
            />
            <span class="text-coolGray-450">
              {{ derivativeMarket.quoteToken.symbol }}
            </span>
          </p>
        </div>
        <div class="flex justify-between items-center text-xs font-medium">
          <CommonHeaderTooltip
            tooltip="The amount of capital required to open this position"
          >
            <p class="text-yellow-600/90">Margin</p>
          </CommonHeaderTooltip>
          <p class="flex space-x-2">
            <SharedAmount
              v-bind="{
                useSubscript: true,
                noTrailingZeros: false,
                shouldAbbreviate: false,
                amount: details.margin.value.toFixed()
              }"
            />
            <span class="text-coolGray-450">
              {{ derivativeMarket.quoteToken.symbol }}
            </span>
          </p>
        </div>
        <div class="flex justify-between items-center text-xs font-medium">
          <CommonHeaderTooltip
            tooltip="The total margin including all fees for this order"
          >
            <p class="text-yellow-600/90">Margin with Fee</p>
          </CommonHeaderTooltip>
          <p class="flex space-x-2">
            <SharedAmount
              v-bind="{
                useSubscript: true,
                noTrailingZeros: false,
                shouldAbbreviate: false,
                amount: details.marginWithFee.value.toFixed()
              }"
            />
            <span class="text-coolGray-450">
              {{ derivativeMarket.quoteToken.symbol }}
            </span>
          </p>
        </div>
        <hr class="border-white/30" />
        <div class="flex justify-between items-center text-xs font-medium">
          <CommonHeaderTooltip
            tooltip="The minimum amount in quote required for this trade"
          >
            <p class="text-yellow-600/90">Minimum Amount in Quote</p>
          </CommonHeaderTooltip>
          <p class="flex space-x-2">
            <SharedAmount
              v-bind="{
                useSubscript: true,
                noTrailingZeros: false,
                shouldAbbreviate: false,
                amount: props.details.minimumAmountInQuote.value
              }"
            />
          </p>
        </div>
        <div class="flex justify-between items-center text-xs font-medium">
          <CommonHeaderTooltip
            tooltip="Whether the notional is less than the minimum notional for this market"
          >
            <p class="text-yellow-600/90">Notional Less Than Min Notional</p>
          </CommonHeaderTooltip>
          <p class="text-white">
            {{
              props.details.isNotionalLessThanMinNotional.value ? 'Yes' : 'No'
            }}
          </p>
        </div>
        <template v-if="!isLimit">
          <hr class="border-white/30" />
          <div
            v-if="!isTriggerOrder"
            class="flex justify-between items-center text-xs font-medium"
          >
            <CommonHeaderTooltip
              tooltip="Estimated slippage percentage based on current market liquidity"
            >
              <p class="text-yellow-600/90">Est Slippage Percentage</p>
            </CommonHeaderTooltip>
            <p class="text-white flex space-x-2">
              <SharedAmount
                v-bind="{
                  useSubscript: true,
                  noTrailingZeros: false,
                  shouldAbbreviate: false,
                  amount: details.estSlippagePercentage.value
                }"
              />%
              <span class="invisible">{{
                derivativeMarket.quoteToken.symbol
              }}</span>
            </p>
          </div>

          <div class="flex justify-between items-center text-xs font-medium">
            <CommonHeaderTooltip
              tooltip="Your maximum acceptable slippage percentage for this trade"
            >
              <p class="text-yellow-600/90">Slippage Tolerance</p>
            </CommonHeaderTooltip>
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
            <CommonHeaderTooltip
              tooltip="Worst possible execution price considering slippage"
            >
              <p class="text-yellow-600/90">Slippage Price</p>
            </CommonHeaderTooltip>
            <p class="flex space-x-2">
              <SharedAmount
                v-bind="{
                  useSubscript: true,
                  amount: details.slippagePrice.value,
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
          <CommonHeaderTooltip
            tooltip="The worst price used to fill the order based on current orderbook depth"
          >
            <p class="text-yellow-600/90">Worst Price</p>
          </CommonHeaderTooltip>
          <p class="flex space-x-2">
            <SharedAmount
              v-bind="{
                useSubscript: true,
                noTrailingZeros: false,
                shouldAbbreviate: false,
                amount: details.worstPrice.value.toFixed(),
                decimals: derivativeMarket.priceDecimals
              }"
            />
            <span class="text-coolGray-450">
              {{ derivativeMarket.quoteToken.symbol }}
            </span>
          </p>
        </div>
        <div class="flex justify-between items-center text-xs font-medium">
          <CommonHeaderTooltip
            tooltip="The average price you would pay across the entire order"
          >
            <p class="text-yellow-600/90">Average Price</p>
          </CommonHeaderTooltip>
          <p class="flex space-x-2">
            <SharedAmount
              v-bind="{
                useSubscript: true,
                noTrailingZeros: false,
                shouldAbbreviate: false,
                decimals: derivativeMarket.priceDecimals,
                amount: details.averagePrice.value.toFixed()
              }"
            />
            <span class="text-coolGray-450">
              {{ derivativeMarket.quoteToken.symbol }}
            </span>
          </p>
        </div>
        <div class="flex justify-between items-center text-xs font-medium">
          <CommonHeaderTooltip
            tooltip="The best price used to fill the order based on current orderbook depth"
          >
            <p class="text-yellow-600/90">Best Price</p>
          </CommonHeaderTooltip>
          <p class="flex space-x-2">
            <SharedAmount
              v-bind="{
                useSubscript: true,
                noTrailingZeros: false,
                shouldAbbreviate: false,
                amount: details.bestPrice.value.toFixed(),
                decimals: derivativeMarket.priceDecimals
              }"
            />
            <span class="text-coolGray-450">
              {{ derivativeMarket.quoteToken.symbol }}
            </span>
          </p>
        </div>
        <template v-if="!isLimit && !isTriggerOrder">
          <hr class="border-white/30" />
          <div class="flex justify-between items-center text-xs font-medium">
            <CommonHeaderTooltip
              tooltip="Whether there's sufficient liquidity to execute this order"
            >
              <p class="text-yellow-600/90">Enough Liquidity</p>
            </CommonHeaderTooltip>
            <p class="text-white">
              {{ details.enoughLiquidity.value ? 'Yes' : 'No' }}
            </p>
          </div>
          <div class="flex justify-between items-center text-xs font-medium">
            <CommonHeaderTooltip
              tooltip="Whether estimated slippage exceeds your tolerance threshold"
            >
              <p class="text-yellow-600/90">Slippage Warning</p>
            </CommonHeaderTooltip>
            <p class="text-white">
              {{ details.slippageWarning.value ? 'Yes' : 'No' }}
            </p>
          </div>
        </template>
      </div>
    </AppCollapse>

    <ModalsFuturesSlippage />
  </div>
</template>
