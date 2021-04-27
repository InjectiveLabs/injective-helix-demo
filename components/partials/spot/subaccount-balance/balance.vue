<template>
  <tr>
    <td is="v-ui-table-td">
      <p class="text-gray-200 font-semibold text-xs">
        {{ balance.token.symbol }}
      </p>
    </td>
    <td is="v-ui-table-td" xs right>
      <v-ui-format-amount
        v-bind="{
          value: balance.availableBalance.toBase(balance.token.decimals)
        }"
      />
    </td>
    <td is="v-ui-table-td" xs right>
      <v-ui-format-amount
        v-bind="{
          value: balance.totalBalance.toBase(balance.token.decimals)
        }"
      />
    </td>
  </tr>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { UiSubaccountBalanceWithToken } from '~/types'

export default Vue.extend({
  props: {
    balance: {
      required: true,
      type: Object as PropType<UiSubaccountBalanceWithToken>
    }
  }
})
</script>
