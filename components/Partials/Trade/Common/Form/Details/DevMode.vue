<script setup lang="ts">
import { BigNumberInBase } from '@injectivelabs/utils'
import {
  MarketKey,
  IsSpotKey,
  TradeDetails,
  SpotMarketCyTags,
  PerpetualMarketCyTags
} from '@/types'
import type {
  UiSpotMarket,
  UiMarketWithToken,
  UiDerivativeMarket
} from '@/types'

const isSpot = inject(IsSpotKey)
const market = inject(MarketKey) as Ref<UiMarketWithToken>

withDefaults(
  defineProps<{
    isLimitOrder?: boolean
    isTriggerOrder?: boolean
    tradeDetails: TradeDetails
    slippagePercentage: string
  }>(),
  {}
)

const cyTags = computed(() =>
  isSpot ? SpotMarketCyTags : PerpetualMarketCyTags
)

const spotMarket = computed(() => market.value as UiSpotMarket)
const derivativeMarket = computed(() => market.value as UiDerivativeMarket)
</script>

<template>
  <PartialsTradeCommonFormDetailsRow
    labelClass="text-yellow-600/90"
    tooltip="The amount you're trading in the base asset"
  >
    <template #label>Quantity</template>
    <template #value>
      <p class="flex space-x-2">
        <SharedAmount
          v-bind="{
            useSubscript: true,
            noTrailingZeros: false,
            shouldAbbreviate: false,
            decimals: market.quantityDecimals,
            amount: tradeDetails.quantity.value
          }"
          :data-cy="dataCyTag(cyTags.Quantity)"
        />
        <span class="text-coolGray-450">{{ market.baseToken.symbol }} </span>
      </p>
    </template>
  </PartialsTradeCommonFormDetailsRow>

  <PartialsTradeCommonFormDetailsRow
    labelClass="text-yellow-600/90"
    tooltip="The notional value in the quote asset"
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
          :data-cy="dataCyTag(cyTags.Notional)"
        />
        <span class="text-coolGray-450">{{ market.quoteToken.symbol }} </span>
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
          :data-cy="dataCyTag(cyTags.CalculatedNotional)"
        />
        <span class="text-coolGray-450">{{ market.quoteToken.symbol }} </span>
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
          :data-cy="dataCyTag(cyTags.FeeRate)"
        />%
        <span class="invisible">{{ market.quoteToken.symbol }} </span>
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
          :data-cy="dataCyTag(cyTags.FeeAmount)"
        />
        <span class="text-coolGray-450">{{ market.quoteToken.symbol }} </span>
      </p>
    </template>
  </PartialsTradeCommonFormDetailsRow>

  <PartialsTradeCommonFormDetailsRow
    labelClass="text-yellow-600/90"
    tooltip="The total notional value including fees (notional + fees)"
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
          :data-cy="dataCyTag(cyTags.TotalNotional)"
        />
        <span class="text-coolGray-450">{{ market.quoteToken.symbol }} </span>
      </p>
    </template>
  </PartialsTradeCommonFormDetailsRow>

  <template v-if="!isSpot">
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
  </template>

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
          :data-cy="dataCyTag(cyTags.MinimumAmountInQuote)"
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
      <p :data-cy="dataCyTag(cyTags.IsNotionalLessThanMinNotional)">
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
      v-if="isSpot || !isTriggerOrder"
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
            :data-cy="dataCyTag(cyTags.EstimatedSlippage)"
          />%
          <span class="invisible">{{ market.quoteToken.symbol }} </span>
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
            :data-cy="dataCyTag(cyTags.SlippageTolerance)"
          />%
          <span class="invisible"> {{ market.quoteToken.symbol }} </span>
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
            :data-cy="dataCyTag(cyTags.SlippagePrice)"
          />
          <span class="text-coolGray-450">{{ market.quoteToken.symbol }} </span>
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
            decimals: market.priceDecimals,
            amount: tradeDetails.worstPrice.value
          }"
          :data-cy="dataCyTag(cyTags.WorstPrice)"
        />
        <span class="text-coolGray-450">{{ market.quoteToken.symbol }} </span>
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
            decimals: market.priceDecimals,
            amount: tradeDetails.averagePrice.value
          }"
          :data-cy="dataCyTag(cyTags.AveragePrice)"
        />
        <span class="text-coolGray-450">{{ market.quoteToken.symbol }} </span>
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
            decimals: market.priceDecimals,
            amount: tradeDetails.bestPrice.value
          }"
          :data-cy="dataCyTag(cyTags.BestPrice)"
        />
        <span class="text-coolGray-450">{{ market.quoteToken.symbol }} </span>
      </p>
    </template>
  </PartialsTradeCommonFormDetailsRow>

  <template v-if="!isLimitOrder && (isSpot || !isTriggerOrder)">
    <hr class="border-white/30" />
    <PartialsTradeCommonFormDetailsRow
      labelClass="text-yellow-600/90"
      tooltip="Whether there's sufficient liquidity to execute this order"
    >
      <template #label>Enough Liquidity</template>
      <template #value>
        <p :data-cy="dataCyTag(cyTags.EnoughLiquidity)">
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
        <p :data-cy="dataCyTag(cyTags.SlippageWarning)">
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
            decimals: market.priceDecimals,
            amount: tradeDetails.executionPrice.value
          }"
          :data-cy="dataCyTag(cyTags.ExecutionPrice)"
        />
        <span class="text-coolGray-450">{{ market.quoteToken.symbol }} </span>
      </p>
    </template>
  </PartialsTradeCommonFormDetailsRow>
</template>
