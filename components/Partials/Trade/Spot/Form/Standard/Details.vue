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
  <PartialsTradeCommonFormDetails is-spot>
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
              estSlippagePercentage: tradeDetails.estSlippagePercentage.value,
              showEstSlippage: tradeDetails.enoughLiquidity.value,
              estSlippageCyTag: dataCyTag(
                SpotMarketCyTags.DisplayedEstimatedSlippage
              ),
              slippagePercentageCyTag: dataCyTag(
                SpotMarketCyTags.DisplayedSlippageTolerance
              )
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
      <PartialsTradeCommonFormDetailsRow
        labelClass="text-yellow-600/90"
        tooltip="The amount of base asset you're trading"
      >
        <template #label>Quantity</template>
        <template #value>
          <p class="flex space-x-2">
            <SharedAmount
              v-bind="{
                amount: tradeDetails.quantity.value,
                useSubscript: true,
                noTrailingZeros: false,
                shouldAbbreviate: false,
                decimals: spotMarket.quantityDecimals
              }"
              :data-cy="dataCyTag(SpotMarketCyTags.Quantity)"
            />
            <span class="text-coolGray-450">
              {{ spotMarket.baseToken.symbol }}
            </span>
          </p>
        </template>
      </PartialsTradeCommonFormDetailsRow>

      <PartialsTradeCommonFormDetailsRow
        labelClass="text-yellow-600/90"
        tooltip="The notional value of your trade in the quote asset"
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
              :data-cy="dataCyTag(SpotMarketCyTags.Notional)"
            />
            <span class="text-coolGray-450">
              {{ spotMarket.quoteToken.symbol }}
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
              :data-cy="dataCyTag(SpotMarketCyTags.CalculatedNotional)"
            />
            <span class="text-coolGray-450">
              {{ spotMarket.quoteToken.symbol }}
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
              :data-cy="dataCyTag(SpotMarketCyTags.FeeRate)"
            />%
            <span class="invisible">{{ spotMarket.quoteToken.symbol }}</span>
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
                amount: tradeDetails.feeAmount.value,
                useSubscript: true,
                noTrailingZeros: false,
                shouldAbbreviate: false
              }"
              :data-cy="dataCyTag(SpotMarketCyTags.FeeAmount)"
            />
            <span class="text-coolGray-450">
              {{ spotMarket.quoteToken.symbol }}
            </span>
          </p>
        </template>
      </PartialsTradeCommonFormDetailsRow>

      <PartialsTradeCommonFormDetailsRow
        labelClass="text-yellow-600/90"
        tooltip="The total value including fees (notional + fee amount)"
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
              :data-cy="dataCyTag(SpotMarketCyTags.TotalNotional)"
            />
            <span class="text-coolGray-450">
              {{ spotMarket.quoteToken.symbol }}
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
              :data-cy="dataCyTag(SpotMarketCyTags.MinimumAmountInQuote)"
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
            :data-cy="dataCyTag(SpotMarketCyTags.IsNotionalLessThanMinNotional)"
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
                :data-cy="dataCyTag(SpotMarketCyTags.EstimatedSlippage)"
              />%
              <span class="invisible">{{ spotMarket.quoteToken.symbol }}</span>
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
                  amount: slippagePercentage
                }"
                :data-cy="dataCyTag(SpotMarketCyTags.SlippageTolerance)"
              />%
              <span class="invisible">{{ spotMarket.quoteToken.symbol }}</span>
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
                  amount: tradeDetails.slippagePrice.value,
                  noTrailingZeros: false,
                  shouldAbbreviate: false
                }"
                :data-cy="dataCyTag(SpotMarketCyTags.SlippagePrice)"
              />
              <span class="text-coolGray-450">
                {{ spotMarket.quoteToken.symbol }}
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
                decimals: spotMarket.priceDecimals,
                amount: tradeDetails.worstPrice.value
              }"
              :data-cy="dataCyTag(SpotMarketCyTags.WorstPrice)"
            />
            <span class="text-coolGray-450">
              {{ spotMarket.quoteToken.symbol }}
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
                decimals: spotMarket.priceDecimals,
                amount: tradeDetails.averagePrice.value
              }"
              :data-cy="dataCyTag(SpotMarketCyTags.AveragePrice)"
            />
            <span class="text-coolGray-450">
              {{ spotMarket.quoteToken.symbol }}
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
                decimals: spotMarket.priceDecimals,
                amount: tradeDetails.bestPrice.value
              }"
              :data-cy="dataCyTag(SpotMarketCyTags.BestPrice)"
            />
            <span class="text-coolGray-450">
              {{ spotMarket.quoteToken.symbol }}
            </span>
          </p>
        </template>
      </PartialsTradeCommonFormDetailsRow>
      <template v-if="!isLimitOrder">
        <hr class="border-white/30" />
        <PartialsTradeCommonFormDetailsRow
          labelClass="text-yellow-600/90"
          tooltip="Whether there's sufficient liquidity to execute this order"
        >
          <template #label>Enough Liquidity</template>
          <template #value>
            <p :data-cy="dataCyTag(SpotMarketCyTags.EnoughLiquidity)">
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
            <p :data-cy="dataCyTag(SpotMarketCyTags.SlippageWarning)">
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
                decimals: spotMarket.priceDecimals,
                amount: tradeDetails.executionPrice.value
              }"
              :data-cy="dataCyTag(SpotMarketCyTags.ExecutionPrice)"
            />
            <span class="text-coolGray-450">
              {{ spotMarket.quoteToken.symbol }}
            </span>
          </p>
        </template>
      </PartialsTradeCommonFormDetailsRow>
    </template>
  </PartialsTradeCommonFormDetails>
</template>
