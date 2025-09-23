<script setup lang="ts">
import { OrderbookWorkerKey, UiSpotMarket } from '~/types'

const props = defineProps<{
  market: UiSpotMarket
}>()

const slippagePercentage = computed(() => '0.01')

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
  estSlippagePercentage,
  slippageWarning
} = useSpotDetails({
  isBuy: computed(() => true),
  market: computed(() => props.market),
  slippagePercentage
})

const tableData = computed(() => [
  { label: 'Quantity', value: quantity },
  { label: 'Notional', value: notional },
  {
    label: 'Slippage Percentage',
    value: `${(Number(slippagePercentage.value) * 100).toFixed(2)} %`
  },
  {
    label: 'Estimated Slippage Percentage',
    value: `${estSlippagePercentage.value} %`
  },
  {
    label: 'Slippage Warning',
    value: slippageWarning
  },
  { label: 'Best Price', value: bestPrice },
  { label: 'Average Price', value: averagePrice },
  { label: 'Worst Price', value: worstPrice },
  { label: 'Slippage Price', value: slippagePrice },
  { label: 'Calculated Notional', value: calculatedNotional },
  { label: 'Fee Amount', value: feeAmount },
  { label: 'Total Notional', value: totalNotional },
  { label: 'Enough Liquidity', value: enoughLiquidity }
])
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
        <tr v-for="item in tableData" :key="item.label">
          <td>{{ item.label }}</td>
          <td>{{ item.value }}</td>
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
