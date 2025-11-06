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
    isLimitOrder: boolean
    isTriggerOrder: boolean
    tradeDetails: TradeDetails
    estLiquidationPrice: BigNumberInBase
  }>(),
  {}
)

const derivativeFormValues = useFormValues<DerivativesTradeForm>()

const slippageTolerance = computed(
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
              slippageTolerance,
              estSlippagePercentage: tradeDetails.estSlippagePercentage.value,
              estSlippageCyTag: dataCyTag(
                PerpetualMarketCyTags.DisplayedEstimatedSlippage
              ),
              slippageToleranceCyTag: dataCyTag(
                PerpetualMarketCyTags.DisplayedSlippageTolerance
              ),
              showEstSlippage:
                tradeDetails.enoughLiquidity.value && !isTriggerOrder
            }"
            @click="openSlippageModal"
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
        <template #label>{{ $t('trade.makerTakerRate') }}</template>
        <template #value>
          <p :data-cy="dataCyTag(PerpetualMarketCyTags.DetailsMakerTakerRate)">
            {{ makerFeeRateToFixed }}% / {{ takerFeeRateToFixed }}%
          </p>
        </template>
      </PartialsTradeCommonFormDetailsRow>

      <PartialsTradeCommonFormDetailsRow v-else>
        <template #label>{{ $t('trade.makerRate') }}</template>
        <template #value>
          <p>{{ makerFeeRateToFixed }}%</p>
        </template>
      </PartialsTradeCommonFormDetailsRow>
    </template>

    <template #devMode>
      <PartialsTradeCommonFormDetailsRow
        labelClass="text-yellow-600/90"
        tooltip="The amount of contracts you're trading"
      >
        <template #label>Quantity</template>
        <template #value>
          <p class="flex space-x-2">
            <SharedAmount
              v-bind="{
                useSubscript: true,
                noTrailingZeros: false,
                shouldAbbreviate: false,
                amount: tradeDetails.quantity.value,
                decimals: derivativeMarket.quantityDecimals
              }"
              :data-cy="dataCyTag(PerpetualMarketCyTags.Quantity)"
            />
            <span class="text-coolGray-450">
              {{ derivativeMarket.baseToken.symbol }}
            </span>
          </p>
        </template>
      </PartialsTradeCommonFormDetailsRow>

      <PartialsTradeCommonFormDetailsRow
        labelClass="text-yellow-600/90"
        tooltip="The notional value of your position in the quote asset"
      >
        <template #label>Notional</template>
        <template #value>
          <p class="flex space-x-2">
            <SharedAmount
              v-bind="{
                useSubscript: true,
                noTrailingZeros: false,
                shouldAbbreviate: false,
                amount: tradeDetails.notional.value
              }"
              :data-cy="dataCyTag(PerpetualMarketCyTags.Notional)"
            />
            <span class="text-coolGray-450">
              {{ derivativeMarket.quoteToken.symbol }}
            </span>
          </p>
        </template>
      </PartialsTradeCommonFormDetailsRow>

      <PartialsTradeCommonFormDetailsRow
        labelClass="text-yellow-600/90"
        tooltip="The notional value adjusted for estimated execution price and quantized quantity"
      >
        <template #label>Calculated Notional</template>
        <template #value>
          <p class="flex space-x-2">
            <SharedAmount
              v-bind="{
                useSubscript: true,
                noTrailingZeros: false,
                shouldAbbreviate: false,
                amount: tradeDetails.calculatedNotional.value
              }"
              :data-cy="dataCyTag(PerpetualMarketCyTags.CalculatedNotional)"
            />
            <span class="text-coolGray-450">
              {{ derivativeMarket.quoteToken.symbol }}
            </span>
          </p>
        </template>
      </PartialsTradeCommonFormDetailsRow>

      <PartialsTradeCommonFormDetailsRow
        labelClass="text-yellow-600/90"
        tooltip="The fee rate multiplicator used to calculate fees (shown as percentage)"
      >
        <template #label>Fee Rate</template>
        <template #value>
          <p class="flex space-x-2">
            <SharedAmount
              v-bind="{
                useSubscript: true,
                noTrailingZeros: false,
                shouldAbbreviate: false,
                amount: tradeDetails.feeRate.value.times(100)
              }"
              :data-cy="dataCyTag(PerpetualMarketCyTags.FeeRate)"
            />%
            <span class="invisible">{{
              derivativeMarket.quoteToken.symbol
            }}</span>
          </p>
        </template>
      </PartialsTradeCommonFormDetailsRow>

      <PartialsTradeCommonFormDetailsRow
        labelClass="text-yellow-600/90"
        tooltip="The trading fee charged for this order"
      >
        <template #label>Fee Amount</template>
        <template #value>
          <p class="flex space-x-2">
            <SharedAmount
              v-bind="{
                useSubscript: true,
                noTrailingZeros: false,
                shouldAbbreviate: false,
                amount: tradeDetails.feeAmount.value
              }"
              :data-cy="dataCyTag(PerpetualMarketCyTags.FeeAmount)"
            />
            <span class="text-coolGray-450">
              {{ derivativeMarket.quoteToken.symbol }}
            </span>
          </p>
        </template>
      </PartialsTradeCommonFormDetailsRow>

      <PartialsTradeCommonFormDetailsRow
        labelClass="text-yellow-600/90"
        tooltip="The total notional value of your position (calculated notional + fees)"
      >
        <template #label>Total Notional</template>
        <template #value>
          <p class="flex space-x-2">
            <SharedAmount
              v-bind="{
                useSubscript: true,
                noTrailingZeros: false,
                shouldAbbreviate: false,
                amount: tradeDetails.notionalWithFee.value
              }"
              :data-cy="dataCyTag(PerpetualMarketCyTags.TotalNotional)"
            />
            <span class="text-coolGray-450">
              {{ derivativeMarket.quoteToken.symbol }}
            </span>
          </p>
        </template>
      </PartialsTradeCommonFormDetailsRow>

      <PartialsTradeCommonFormDetailsRow
        labelClass="text-yellow-600/90"
        tooltip="The amount of capital required to open this position"
      >
        <template #label>Margin</template>
        <template #value>
          <p class="flex space-x-2">
            <SharedAmount
              v-bind="{
                useSubscript: true,
                noTrailingZeros: false,
                shouldAbbreviate: false,
                amount: tradeDetails.margin.value
              }"
              :data-cy="dataCyTag(PerpetualMarketCyTags.Margin)"
            />
            <span class="text-coolGray-450">
              {{ derivativeMarket.quoteToken.symbol }}
            </span>
          </p>
        </template>
      </PartialsTradeCommonFormDetailsRow>

      <PartialsTradeCommonFormDetailsRow
        labelClass="text-yellow-600/90"
        tooltip="The total margin including all fees for this order"
      >
        <template #label>Margin with Fee</template>
        <template #value>
          <p class="flex space-x-2">
            <SharedAmount
              v-bind="{
                useSubscript: true,
                noTrailingZeros: false,
                shouldAbbreviate: false,
                amount: tradeDetails.marginWithFee.value
              }"
              :data-cy="dataCyTag(PerpetualMarketCyTags.MarginWithFee)"
            />
            <span class="text-coolGray-450">
              {{ derivativeMarket.quoteToken.symbol }}
            </span>
          </p>
        </template>
      </PartialsTradeCommonFormDetailsRow>

      <hr class="border-white/30" />

      <PartialsTradeCommonFormDetailsRow
        labelClass="text-yellow-600/90"
        tooltip="The minimum amount in quote required for this trade"
      >
        <template #label>Minimum Amount in Quote</template>
        <template #value>
          <p class="flex space-x-2">
            <SharedAmount
              v-bind="{
                useSubscript: true,
                noTrailingZeros: false,
                shouldAbbreviate: false,
                amount: tradeDetails.minimumAmountInQuote.value
              }"
              :data-cy="dataCyTag(PerpetualMarketCyTags.MinimumAmountInQuote)"
            />
          </p>
        </template>
      </PartialsTradeCommonFormDetailsRow>

      <PartialsTradeCommonFormDetailsRow
        labelClass="text-yellow-600/90"
        tooltip="Whether the notional is less than the minimum notional for this market"
      >
        <template #label>Notional Less Than Min Notional</template>
        <template #value>
          <p
            :data-cy="
              dataCyTag(PerpetualMarketCyTags.IsNotionalLessThanMinNotional)
            "
          >
            {{
              new BigNumberInBase(tradeDetails.notional.value).lte(
                tradeDetails.minimumAmountInQuote.value
              )
                ? 'Yes'
                : 'No'
            }}
          </p>
        </template>
      </PartialsTradeCommonFormDetailsRow>

      <template v-if="!isLimitOrder">
        <hr class="border-white/30" />
        <PartialsTradeCommonFormDetailsRow
          v-if="!isTriggerOrder"
          labelClass="text-yellow-600/90"
          tooltip="Estimated slippage percentage based on current market liquidity"
        >
          <template #label>Est Slippage Percentage</template>
          <template #value>
            <p class="flex space-x-2">
              <SharedAmount
                v-bind="{
                  useSubscript: true,
                  noTrailingZeros: false,
                  shouldAbbreviate: false,
                  amount: tradeDetails.estSlippagePercentage.value
                }"
                :data-cy="dataCyTag(PerpetualMarketCyTags.EstimatedSlippage)"
              />%
              <span class="invisible">{{
                derivativeMarket.quoteToken.symbol
              }}</span>
            </p>
          </template>
        </PartialsTradeCommonFormDetailsRow>

        <PartialsTradeCommonFormDetailsRow
          labelClass="text-yellow-600/90"
          tooltip="Your maximum acceptable slippage percentage for this trade"
        >
          <template #label>Slippage Tolerance</template>
          <template #value>
            <p class="flex space-x-2">
              <SharedAmount
                v-bind="{
                  useSubscript: true,
                  noTrailingZeros: false,
                  shouldAbbreviate: false,
                  amount: slippageTolerance
                }"
                :data-cy="dataCyTag(PerpetualMarketCyTags.SlippageTolerance)"
              />%
              <span class="invisible">{{
                derivativeMarket.quoteToken.symbol
              }}</span>
            </p>
          </template>
        </PartialsTradeCommonFormDetailsRow>

        <PartialsTradeCommonFormDetailsRow
          labelClass="text-yellow-600/90"
          tooltip="Worst possible execution price considering slippage"
        >
          <template #label>Slippage Price</template>
          <template #value>
            <p class="flex space-x-2">
              <SharedAmount
                v-bind="{
                  useSubscript: true,
                  noTrailingZeros: false,
                  shouldAbbreviate: false,
                  amount: tradeDetails.slippagePrice.value
                }"
                :data-cy="dataCyTag(PerpetualMarketCyTags.SlippagePrice)"
              />
              <span class="text-coolGray-450">
                {{ derivativeMarket.quoteToken.symbol }}
              </span>
            </p>
          </template>
        </PartialsTradeCommonFormDetailsRow>
      </template>

      <hr class="border-white/30" />

      <PartialsTradeCommonFormDetailsRow
        labelClass="text-yellow-600/90"
        tooltip="The worst price used to fill the order based on current orderbook depth"
      >
        <template #label>Worst Price</template>
        <template #value>
          <p class="flex space-x-2">
            <SharedAmount
              v-bind="{
                useSubscript: true,
                noTrailingZeros: false,
                shouldAbbreviate: false,
                amount: tradeDetails.worstPrice.value,
                decimals: derivativeMarket.priceDecimals
              }"
              :data-cy="dataCyTag(PerpetualMarketCyTags.WorstPrice)"
            />
            <span class="text-coolGray-450">
              {{ derivativeMarket.quoteToken.symbol }}
            </span>
          </p>
        </template>
      </PartialsTradeCommonFormDetailsRow>

      <PartialsTradeCommonFormDetailsRow
        labelClass="text-yellow-600/90"
        tooltip="The average price you would pay across the entire order"
      >
        <template #label>Average Price</template>
        <template #value>
          <p class="flex space-x-2">
            <SharedAmount
              v-bind="{
                useSubscript: true,
                noTrailingZeros: false,
                shouldAbbreviate: false,
                amount: tradeDetails.averagePrice.value,
                decimals: derivativeMarket.priceDecimals
              }"
              :data-cy="dataCyTag(PerpetualMarketCyTags.AveragePrice)"
            />
            <span class="text-coolGray-450">
              {{ derivativeMarket.quoteToken.symbol }}
            </span>
          </p>
        </template>
      </PartialsTradeCommonFormDetailsRow>

      <PartialsTradeCommonFormDetailsRow
        labelClass="text-yellow-600/90"
        tooltip="The best price used to fill the order based on current orderbook depth"
      >
        <template #label>Best Price</template>
        <template #value>
          <p class="flex space-x-2">
            <SharedAmount
              v-bind="{
                useSubscript: true,
                noTrailingZeros: false,
                shouldAbbreviate: false,
                amount: tradeDetails.bestPrice.value,
                decimals: derivativeMarket.priceDecimals
              }"
              :data-cy="dataCyTag(PerpetualMarketCyTags.BestPrice)"
            />
            <span class="text-coolGray-450">
              {{ derivativeMarket.quoteToken.symbol }}
            </span>
          </p>
        </template>
      </PartialsTradeCommonFormDetailsRow>

      <template v-if="!isLimitOrder && !isTriggerOrder">
        <hr class="border-white/30" />
        <PartialsTradeCommonFormDetailsRow
          labelClass="text-yellow-600/90"
          tooltip="Whether there's sufficient liquidity to execute this order"
        >
          <template #label>Enough Liquidity</template>
          <template #value>
            <p :data-cy="dataCyTag(PerpetualMarketCyTags.EnoughLiquidity)">
              {{ tradeDetails.enoughLiquidity.value ? 'Yes' : 'No' }}
            </p>
          </template>
        </PartialsTradeCommonFormDetailsRow>

        <PartialsTradeCommonFormDetailsRow
          labelClass="text-yellow-600/90"
          tooltip="Whether estimated slippage exceeds your tolerance threshold"
        >
          <template #label>Slippage Warning</template>
          <template #value>
            <p :data-cy="dataCyTag(PerpetualMarketCyTags.SlippageWarning)">
              {{ tradeDetails.hasSlippageWarning.value ? 'Yes' : 'No' }}
            </p>
          </template>
        </PartialsTradeCommonFormDetailsRow>
      </template>

      <hr class="border-white/30" />

      <PartialsTradeCommonFormDetailsRow
        labelClass="text-yellow-600/90"
        tooltip="The actual worst price sent to the chain"
      >
        <template #label>Execution Price</template>
        <template #value>
          <p class="flex space-x-2">
            <SharedAmount
              v-bind="{
                useSubscript: true,
                noTrailingZeros: false,
                shouldAbbreviate: false,
                decimals: derivativeMarket.priceDecimals,
                amount: tradeDetails.executionPrice.value
              }"
              :data-cy="dataCyTag(PerpetualMarketCyTags.ExecutionPrice)"
            />
            <span class="text-coolGray-450">
              {{ derivativeMarket.quoteToken.symbol }}
            </span>
          </p>
        </template>
      </PartialsTradeCommonFormDetailsRow>
    </template>
  </PartialsTradeCommonFormDetails>
</template>
