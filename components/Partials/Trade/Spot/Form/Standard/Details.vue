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
  quantity: detailsQuantity,
  notional: detailsNotional,
  feeAmount: detailsFeeAmount,
  bestPrice: detailsBestPrice,
  worstPrice: detailsWorstPrice,
  averagePrice: detailsAveragePrice,
  slippagePrice: detailsSlippagePrice,
  totalNotional: detailsTotalNotional,
  enoughLiquidity: detailsEnoughLiquidity,
  slippageWarning: detailsSlippageWarning,
  calculatedNotional: detailsCalculatedNotional,
  estSlippagePercentage: detailsEstSlippagePercentage
} = useSpotDetails({
  takerFeeRate,
  market: computed(() => spotMarket.value),
  limitPrice: computed(
    () => spotFormValues.value[SpotTradeFormField.Price] || '0'
  ),
  slippagePercentage: computed(
    () => spotFormValues.value[SpotTradeFormField.Slippage] || '0'
  ),
  isPostOnly: computed(
    () => spotFormValues.value[SpotTradeFormField.PostOnly] || false
  ),
  isBuy: computed(
    () => spotFormValues.value[SpotTradeFormField.Side] === OrderSide.Buy
  ),
  isLimitOrder: computed(
    () => spotFormValues.value[SpotTradeFormField.Type] === TradeTypes.Limit
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
  [() => spotFormValues.value],
  ([formValues]) => {
    const option =
      formValues[SpotTradeFormField.AmountOption] || TradeAmountOption.Base
    const amount = formValues[SpotTradeFormField.Amount] || '0'

    if (option === TradeAmountOption.Base) {
      detailsQuantity.value = amount
    } else {
      detailsNotional.value = amount
    }
  },
  { deep: true }
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
                  shouldAbbreviate: false,
                  amount: detailsTotalNotional
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
              <span v-if="detailsEnoughLiquidity">
                <i18n-t
                  keypath="trade.estSlippage"
                  class="text-xs text-coolGray-400 mx-1"
                >
                  <template #estSlippage>
                    <SharedAmount
                      v-bind="{
                        useSubscript: true,
                        shouldAbbreviate: false,
                        amount: detailsEstSlippagePercentage
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
          <CommonHeaderTooltip
            tooltip="The amount of base asset you're trading"
          >
            <p class="text-yellow-600/90">Quantity</p>
          </CommonHeaderTooltip>

          <p class="flex space-x-2">
            <SharedAmount
              v-bind="{
                amount: detailsQuantity,
                useSubscript: true,
                noTrailingZeros: false,
                shouldAbbreviate: false,
                decimals: spotMarket.quantityDecimals
              }"
            />
            <span class="text-coolGray-450">
              {{ spotMarket.baseToken.symbol }}
            </span>
          </p>
        </div>
        <div class="flex justify-between items-center text-xs font-medium">
          <CommonHeaderTooltip
            tooltip="The notional value of your trade in the quote asset"
          >
            <p class="text-yellow-600/90">Notional</p>
          </CommonHeaderTooltip>
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
              {{ spotMarket.quoteToken.symbol }}
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
                amount: detailsCalculatedNotional
              }"
            />
            <span class="text-coolGray-450">
              {{ spotMarket.quoteToken.symbol }}
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
                amount: detailsFeeAmount,
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
          <CommonHeaderTooltip
            tooltip="The total value including fees (notional + fee amount)"
          >
            <p class="text-yellow-600/90">Total Notional</p>
          </CommonHeaderTooltip>
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
              {{ spotMarket.quoteToken.symbol }}
            </span>
          </p>
        </div>
        <template v-if="!isLimit">
          <hr class="border-white/30" />
          <div class="flex justify-between items-center text-xs font-medium">
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
                  amount: detailsEstSlippagePercentage
                }"
              />%
              <span class="invisible">{{ spotMarket.quoteToken.symbol }}</span>
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
              <span class="invisible">{{ spotMarket.quoteToken.symbol }}</span>
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
                  amount: detailsSlippagePrice,
                  noTrailingZeros: false,
                  shouldAbbreviate: false
                }"
              />
              <span class="text-coolGray-450">
                {{ spotMarket.quoteToken.symbol }}
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
                amount: detailsWorstPrice.toFixed(),
                decimals: spotMarket.priceDecimals
              }"
            />
            <span class="text-coolGray-450">
              {{ spotMarket.quoteToken.symbol }}
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
                shouldAbbreviate: false,
                amount: detailsAveragePrice.toFixed()
              }"
            />
            <span class="text-coolGray-450">
              {{ spotMarket.quoteToken.symbol }}
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
                amount: detailsBestPrice.toFixed(),
                decimals: spotMarket.priceDecimals
              }"
            />
            <span class="text-coolGray-450">
              {{ spotMarket.quoteToken.symbol }}
            </span>
          </p>
        </div>
        <template v-if="!isLimit">
          <hr class="border-white/30" />
          <div class="flex justify-between items-center text-xs font-medium">
            <CommonHeaderTooltip
              tooltip="Whether there's sufficient liquidity to execute this order"
            >
              <p class="text-yellow-600/90">Enough Liquidity</p>
            </CommonHeaderTooltip>
            <p class="text-white">
              {{ detailsEnoughLiquidity ? 'Yes' : 'No' }}
            </p>
          </div>
          <div class="flex justify-between items-center text-xs font-medium">
            <CommonHeaderTooltip
              tooltip="Whether estimated slippage exceeds your tolerance threshold"
            >
              <p class="text-yellow-600/90">Slippage Warning</p>
            </CommonHeaderTooltip>
            <p class="text-white">
              {{ detailsSlippageWarning ? 'Yes' : 'No' }}
            </p>
          </div>
        </template>
      </div>
    </AppCollapse>

    <ModalsSpotSlippage />
  </div>
</template>
