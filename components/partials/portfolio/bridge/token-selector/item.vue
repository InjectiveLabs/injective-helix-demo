<template>
  <div class="flex items-center justify-between">
    <div class="flex items-center">
      <img
        v-if="tokenLogo"
        :src="tokenLogo"
        :alt="item.token.name"
        class="rounded-full w-6 h-6 mr-3"
        :class="dense ? 'w-4 h-4 mr-3' : 'w-6 h-6 mr-3'"
      />
      <IconCategoryAlt
        v-else
        class="rounded-full w-6 h-6 mr-3"
        :class="dense ? 'w-4 h-4 mr-3' : 'w-6 h-6 mr-3'"
      />
      <div>
        <p
          class="tracking-0.5"
          :class="dense ? 'text-md' : 'text-lg'"
          :data-cy="'token-selector-option-' + item.token.symbol"
        >
          {{ item.token.symbol }}
        </p>
      </div>
    </div>

    <div
      v-if="!dense"
      class=""
      :data-cy="'token-selector-option-balance-' + item.token.symbol"
    >
      {{ balanceToString }}
    </div>
  </div>
</template>
<script lang="ts">
import { BigNumberInBase } from '@injectivelabs/utils'
import {
  BankBalanceWithTokenAndBalance,
  getTokenLogoWithVendorPathPrefix
} from '@injectivelabs/sdk-ui-ts'
import Vue, { PropType } from 'vue'
import { UI_DEFAULT_DISPLAY_DECIMALS } from '~/app/utils/constants'

export default Vue.extend({
  props: {
    dense: {
      type: Boolean,
      default: false
    },
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
    },

    tokenLogo(): string {
      const { item } = this

      if (!item.token) {
        return ''
      }

      return getTokenLogoWithVendorPathPrefix(item.token.logo)
    }
  }
})
</script>
