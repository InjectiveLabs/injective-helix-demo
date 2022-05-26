<template>
  <div class="flex items-center justify-between">
    <div class="flex items-center">
      <img
        v-if="item.token.logo"
        :src="item.token.logo"
        :alt="item.token.name"
        class="rounded-full w-6 h-6 mr-3"
      />
      <IconCategoryAlt v-else class="rounded-full w-6 h-6 mr-3" />
      <div>
        <p
          class="text-lg tracking-0.5"
          :data-cy="'token-selector-option-' + item.token.symbol"
        >
          {{ item.token.symbol }}
        </p>
      </div>
    </div>

    <div
      class=""
      :data-cy="'token-selector-option-balance-' + item.token.symbol"
    >
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
