<script setup lang="ts">
import { DEFAULT_ASSET_DECIMALS } from '@shared/utils/constant'
import { BigNumberInBase } from '@injectivelabs/utils'
import {
  Modal,
  MarketKey,
  TradeDetails,
  DerivativeTradeTypes,
  PerpetualMarketCyTags,
  DerivativesTradeFormField
} from '@/types'
import type { UiDerivativeMarket, DerivativesTradeForm } from '@/types'

const modalStore = useSharedModalStore()

const derivativeMarket = inject(MarketKey) as Ref<UiDerivativeMarket>

withDefaults(
  defineProps<{
    isLimitOrder?: boolean
    isTriggerOrder?: boolean
    tradeDetails: TradeDetails
    estLiquidationPrice: BigNumberInBase
  }>(),
  {}
)

const derivativeFormValues = useFormValues<DerivativesTradeForm>()

const slippagePercentage = computed(
  () => derivativeFormValues.value[DerivativesTradeFormField.Slippage] || '0'
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

function openSlippageModal() {
  modalStore.openModal(Modal.Slippage)
}
</script>

<template>
  <PartialsTradeCommonFormDetails>
    <template #default>
      <PartialsTradeCommonFormDetailsRow>
        <template #label>{{ $t('trade.total') }}</template>
        <template #value>
          <p
            class="flex space-x-2"
            :data-cy="dataCyTag(PerpetualMarketCyTags.DetailsTotal)"
          >
            <span class="flex space-x-2">
              <span>&asymp;</span>
              <SharedAmount
                v-bind="{
                  useSubscript: true,
                  shouldAbbreviate: false,
                  amount: tradeDetails.marginWithFee.value
                }"
              />
            </span>

            <span class="text-coolGray-450">
              {{ derivativeMarket.quoteToken.symbol }}
            </span>
          </p>
        </template>
      </PartialsTradeCommonFormDetailsRow>

      <PartialsTradeCommonFormDetailsRow v-if="!isLimitOrder">
        <template #label>{{ $t('trade.slippage') }}</template>
        <template #value>
          <PartialsTradeCommonFormDetailsSlippage
            v-bind="{
              formAmount,
              slippagePercentage,
              estSlippagePercentage: tradeDetails.estSlippagePercentage.value,
              showEstSlippage:
                tradeDetails.enoughLiquidity.value && !isTriggerOrder
            }"
            @on:click="openSlippageModal"
          />
        </template>
      </PartialsTradeCommonFormDetailsRow>

      <PartialsTradeCommonFormDetailsRow>
        <template #label>{{ $t('trade.margin') }}</template>
        <template #value>
          <p class="flex space-x-2">
            <SharedAmount
              :data-cy="dataCyTag(PerpetualMarketCyTags.DetailsMargin)"
              v-bind="{
                useSubscript: true,
                shouldAbbreviate: false,
                amount: tradeDetails.margin.value
              }"
            />
            <span class="text-coolGray-450">
              {{ derivativeMarket.quoteToken.symbol }}
            </span>
          </p>
        </template>
      </PartialsTradeCommonFormDetailsRow>

      <PartialsTradeCommonFormDetailsRow>
        <template #label>{{ $t('trade.estLiquidationPrice') }}</template>
        <template #value>
          <p class="flex space-x-2">
            <SharedAmount
              :data-cy="
                dataCyTag(PerpetualMarketCyTags.DetailsEstLiquidationPrice)
              "
              v-bind="{
                useSubscript: true,
                shouldAbbreviate: false,
                amount: estLiquidationPrice,
                decimals: derivativeMarket.priceDecimals
              }"
            />
            <span class="text-coolGray-450">
              {{ derivativeMarket.quoteToken.symbol }}
            </span>
          </p>
        </template>
      </PartialsTradeCommonFormDetailsRow>

      <PartialsTradeCommonFormDetailsRow
        v-if="!isMakerFee"
        :tooltip="
          $t('trade.makerTakerRateTooltip', {
            makerFeeRate: makerFeeRateToFixed,
            takerFeeRate: takerFeeRateToFixed
          })
        "
      >
        <template #label>{{ $t('trade.fees') }}</template>
        <template #value>
          <p :data-cy="dataCyTag(PerpetualMarketCyTags.DetailsMakerTakerRate)">
            {{ makerFeeRateToFixed }}% / {{ takerFeeRateToFixed }}%
          </p>
        </template>
      </PartialsTradeCommonFormDetailsRow>

      <PartialsTradeCommonFormDetailsRow v-else>
        <template #label>{{ $t('trade.fees') }}</template>
        <template #value>
          <p>{{ makerFeeRateToFixed }}%</p>
        </template>
      </PartialsTradeCommonFormDetailsRow>
    </template>

    <template #devMode>
      <PartialsTradeCommonFormDetailsDevMode
        v-bind="{
          isLimitOrder,
          tradeDetails,
          isTriggerOrder,
          slippagePercentage
        }"
      />
    </template>
  </PartialsTradeCommonFormDetails>
</template>
