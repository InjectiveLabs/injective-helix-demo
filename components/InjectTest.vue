<script setup lang="ts">
import { UiSpotMarket } from '~/types'

const props = defineProps<{
  market: UiSpotMarket
}>()

const isBuy = ref(true)

const slippagePercentage = computed(() => '0.01')

const {
  quantity,
  notional,
  bestPrice,
  feeAmount,
  worstPrice,
  averagePrice,
  slippagePrice,
  totalNotional,
  enoughLiquidity,
  slippageWarning,
  calculatedNotional,
  estSlippagePercentage
} = useSpotDetails({
  slippagePercentage,
  isPostOnly: computed(() => false),
  limitPrice: computed(() => '0'),
  isBuy: computed(() => isBuy.value),
  isLimitOrder: computed(() => false),
  market: computed(() => props.market)
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
    value: `${(Number(estSlippagePercentage.value) * 100).toFixed(8)} %`
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
        <legend>Order Type</legend>
        <label class="flex items-center gap-2">
          <input v-model="isBuy" type="checkbox" />
          <span>{{ isBuy ? 'Buy' : 'Sell' }}</span>
        </label>
      </fieldset>

      <fieldset>
        <legend>Quantity</legend>
        <input v-model="quantity" type="number" />
        <label>Notional</label>
        <input v-model="notional" type="number" />
      </fieldset>
    </div>
  </div>
</template>
