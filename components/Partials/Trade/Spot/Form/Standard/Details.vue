<script setup lang="ts">
import { DEFAULT_ASSET_DECIMALS } from '@shared/utils/constant'
import { BigNumberInBase } from '@injectivelabs/utils'
import {
  Modal,
  MarketKey,
  TradeDetails,
  UiSpotMarket,
  SpotTradeForm,
  SpotMarketCyTags,
  SpotTradeFormField
} from '@/types'

const modalStore = useSharedModalStore()

const spotMarket = inject(MarketKey) as ComputedRef<UiSpotMarket>

withDefaults(
  defineProps<{
    isLimitOrder: boolean
    tradeDetails: TradeDetails
  }>(),
  {}
)

const spotFormValues = useFormValues<SpotTradeForm>()

const { makerFeeRate, takerFeeRate } = useTradeFee({
  marketTakerFeeRate: spotMarket?.value?.takerFeeRate,
  marketMakerFeeRate: spotMarket?.value?.makerFeeRate
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
  () => spotFormValues.value[SpotTradeFormField.Amount] || '0'
)

const slippagePercentage = computed(
  () => spotFormValues.value[SpotTradeFormField.Slippage] || '0'
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
            :data-cy="dataCyTag(SpotMarketCyTags.DetailsTotal)"
          >
            <span class="flex space-x-2">
              <span>&asymp;</span>
              <SharedAmount
                v-bind="{
                  useSubscript: true,
                  shouldAbbreviate: false,
                  amount: tradeDetails.notionalWithFee.value
                }"
              />
            </span>

            <span class="text-coolGray-450">
              {{ spotMarket.quoteToken.symbol }}
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
              showEstSlippage: tradeDetails.enoughLiquidity.value,
              estSlippagePercentage: tradeDetails.estSlippagePercentage.value
            }"
            @click="openSlippageModal"
          />
        </template>
      </PartialsTradeCommonFormDetailsRow>

      <PartialsTradeCommonFormDetailsRow
        v-if="!isLimitOrder"
        :tooltip="
          $t('trade.makerTakerRateTooltip', {
            makerFeeRate: makerFeeRateToFixed,
            takerFeeRate: takerFeeRateToFixed
          })
        "
      >
        <template #label>{{ $t('trade.makerTakerRate') }}</template>
        <template #value>
          <p :data-cy="dataCyTag(SpotMarketCyTags.DetailsMakerTakerRate)">
            {{ makerFeeRateToFixed }}% / {{ takerFeeRateToFixed }}%
          </p>
        </template>
      </PartialsTradeCommonFormDetailsRow>

      <PartialsTradeCommonFormDetailsRow v-else>
        <template #label>{{ $t('trade.makerRate') }}</template>
        <template #value>
          <p :data-cy="dataCyTag(SpotMarketCyTags.DetailsMakerFeeRate)">
            {{ makerFeeRateToFixed }}%
          </p>
        </template>
      </PartialsTradeCommonFormDetailsRow>
    </template>

    <template #devMode>
      <PartialsTradeCommonFormDetailsDevMode
        v-bind="{
          isLimitOrder,
          tradeDetails,
          slippagePercentage
        }"
      />
    </template>
  </PartialsTradeCommonFormDetails>
</template>
