<template>
  <div class="flex items-center justify-between">
    <div class="flex items-center">
      <img
        v-if="item.token.logo"
        :src="item.token.logo"
        :alt="item.token.name"
        class="rounded-full w-6 h-6 mr-3"
      />
      <v-icon-category-alt v-else class="rounded-full w-6 h-6 mr-3" />
      <div>
        <p class="text-lg tracking-0.5">
          {{ item.token.symbol }}
        </p>
      </div>
    </div>

    <div class="">
      {{ balanceToString }}
    </div>
  </div>
</template>
<script lang="ts">
import { BigNumberInBase } from '@injectivelabs/utils'
import { BankBalanceWithTokenAndBalance } from '@injectivelabs/ui-common'
import Vue, { PropType } from 'vue'
import { UI_DEFAULT_DISPLAY_DECIMALS } from '~/app/utils/constants'

export default Vue.extend({
  props: {
    item: {
      type: Object as PropType<BankBalanceWithTokenAndBalance>,
      required: true
    }
  },

  computed: {
    balanceToString(): String {
      const { item } = this

      return new BigNumberInBase(item.balance).toFormat(
        UI_DEFAULT_DISPLAY_DECIMALS
      )
    }
  }
})
</script>
