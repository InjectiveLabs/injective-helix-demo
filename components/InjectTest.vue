<script setup lang="ts">
import { OrderbookWorkerKey, UiSpotMarket } from '~/types'

const props = defineProps<{
  market: UiSpotMarket
}>()

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
  estSlippagePercentage
} = useSpotDetails({
  isBuy: computed(() => true),
  market: computed(() => props.market),
  slippagePercentage: computed(() => '0.01')
})
</script>

<template>
  <div>
    <table
      class="w-xl table-fixed border border-gray-300 rounded-md [&_td]:p-2 [&_th]:p-2 [&_td]:border [&_th]:border [&_*]:border-white"
    >
      <thead>
        <tr>
          <th>Key</th>
          <th>Value</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Quantity</td>
          <td>{{ quantity }}</td>
        </tr>
        <tr>
          <td>Notional</td>
          <td>{{ notional }}</td>
        </tr>
        <tr>
          <td>Average Price</td>
          <td>{{ averagePrice }}</td>
        </tr>
        <tr>
          <td>Best Price</td>
          <td>{{ bestPrice }}</td>
        </tr>
        <tr>
          <td>Worst Price</td>
          <td>{{ worstPrice }}</td>
        </tr>
        <tr>
          <td>Fee Amount</td>
          <td>{{ feeAmount }}</td>
        </tr>
        <tr>
          <td>Total Notional</td>
          <td>{{ totalNotional }}</td>
        </tr>
        <tr>
          <td>Fee Amount</td>
          <td>{{ feeAmount }}</td>
        </tr>
        <tr>
          <td>Enough Liquidity</td>
          <td>{{ enoughLiquidity }}</td>
        </tr>

        <tr>
          <td>Slippage Price</td>
          <td>{{ slippagePrice }}</td>
        </tr>

        <tr>
          <td>Calculated Notional</td>
          <td>{{ calculatedNotional }}</td>
        </tr>
        <tr>
          <td>Estimated Slippage Percentage</td>
          <td>{{ estSlippagePercentage }} %</td>
        </tr>
      </tbody>
    </table>

    <div>
      <fieldset>
        <legend>Quantity</legend>
        <input v-model="quantity" type="number" />
        <label>Notional</label>
        <input v-model="notional" type="number" />
      </fieldset>
    </div>
  </div>
</template>
