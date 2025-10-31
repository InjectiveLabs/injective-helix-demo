<script setup lang="ts">
import { dataCyTag } from '@shared/utils'
import { NuxtUiIcons } from '@shared/types'
import { DEFAULT_ASSET_DECIMALS } from '@shared/utils/constant'
import {
  Modal,
  MarketKey,
  TradeTypes,
  SpotDetails,
  UiSpotMarket,
  SpotTradeForm,
  SpotMarketCyTags,
  SpotTradeFormField
} from '@/types'
import {
  UI_ZERO_DECIMAL,
  MIN_EST_SLIPPAGE,
  DEFAULT_EST_SLIPPAGE,
  UI_DEFAULT_DISPLAY_DECIMALS
} from '@/app/utils/constants'

const appStore = useAppStore()
const modalStore = useSharedModalStore()

const spotMarket = inject(MarketKey) as ComputedRef<UiSpotMarket>

const props = defineProps<{
  details: SpotDetails
}>()

const isOpen = ref(true)

const spotFormValues = useFormValues<SpotTradeForm>()

const { makerFeeRate, takerFeeRate } = useTradeFee({
  marketTakerFeeRate: spotMarket?.value?.takerFeeRate,
  marketMakerFeeRate: spotMarket?.value?.makerFeeRate
})

const isLimit = computed(
  () => spotFormValues.value[SpotTradeFormField.Type] === TradeTypes.Limit
)

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

const formAmount = computed(
  () => spotFormValues.value[SpotTradeFormField.Amount] || '0'
)

const adaptedEstSlippagePercentage = computed(() => {
  if (formAmount.value === '0') {
    return DEFAULT_EST_SLIPPAGE
  }

  if (props.details.estSlippagePercentage.value.lt(MIN_EST_SLIPPAGE)) {
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
                  amount: props.details.totalNotional.value
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
              <span v-if="details.enoughLiquidity.value">
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
                        decimals: 2,
                        useSubscript: true,
                        noTrailingZeros: false,
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
                amount: props.details.quantity.value,
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
                amount: props.details.notional.value,
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
                amount: props.details.calculatedNotional.value
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
                amount: props.details.feeAmount.value,
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
                amount: props.details.totalNotional.value
              }"
            />
            <span class="text-coolGray-450">
              {{ spotMarket.quoteToken.symbol }}
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
                  amount: props.details.estSlippagePercentage.value
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
                  amount: props.details.slippagePrice.value,
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
                amount: props.details.worstPrice.value,
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
                noTrailingZeros: false,
                shouldAbbreviate: false,
                decimals: spotMarket.priceDecimals,
                amount: props.details.averagePrice.value
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
                amount: props.details.bestPrice.value,
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
              {{ props.details.enoughLiquidity.value ? 'Yes' : 'No' }}
            </p>
          </div>
          <div class="flex justify-between items-center text-xs font-medium">
            <CommonHeaderTooltip
              tooltip="Whether estimated slippage exceeds your tolerance threshold"
            >
              <p class="text-yellow-600/90">Slippage Warning</p>
            </CommonHeaderTooltip>
            <p class="text-white">
              {{ props.details.slippageWarning.value ? 'Yes' : 'No' }}
            </p>
          </div>
        </template>
        <hr class="border-white/30" />
        <div class="flex justify-between items-center text-xs font-medium">
          <CommonHeaderTooltip
            tooltip="The actual worst price sent to the chain"
          >
            <p class="text-yellow-600/90">Final Price</p>
          </CommonHeaderTooltip>
          <SharedAmount
            v-bind="{
              useSubscript: true,
              noTrailingZeros: false,
              shouldAbbreviate: false,
              decimals: spotMarket.priceDecimals,
              amount: props.details.finalPrice.value
            }"
          />
        </div>
      </div>
    </AppCollapse>

    <ModalsSpotSlippage />
  </div>
</template>
