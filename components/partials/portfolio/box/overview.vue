<template>
  <div>
    <div class="p-2 w-full text-center">
      <p class="text-xs uppercase text-gray-400">
        <span class="flex w-full justify-center">
          {{ $t('portfolio_value') }}
          <v-icon-info-tooltip
            class="ml-2"
            :tooltip="$t('portfolio_value_tooltip')"
          />
        </span>
      </p>
      <h2 class="mt-4 text-lg lg:text-2xl font-mono text-gray-100">
        &#8776; {{ totalToString }} USD
      </h2>
    </div>
  </div>
</template>

<script lang="ts">
import { BigNumberInBase } from '@injectivelabs/utils'
import Vue, { PropType } from 'vue'
import { UI_DEFAULT_MIN_DISPLAY_DECIMALS } from '~/app/utils/constants'

export default Vue.extend({
  props: {
    bankBalancesTotalInUsd: {
      required: true,
      type: Object as PropType<BigNumberInBase>
    },

    unrealizedPnLInUsd: {
      required: true,
      type: Object as PropType<BigNumberInBase>
    },

    availableBalanceInUsd: {
      required: true,
      type: Object as PropType<BigNumberInBase>
    },

    lockedBalanceInUsd: {
      required: true,
      type: Object as PropType<BigNumberInBase>
    }
  },

  computed: {
    isUserWalletConnected(): boolean {
      return this.$accessor.wallet.isUserWalletConnected
    },

    total(): BigNumberInBase {
      const {
        bankBalancesTotalInUsd,
        unrealizedPnLInUsd,
        availableBalanceInUsd,
        lockedBalanceInUsd
      } = this

      return bankBalancesTotalInUsd
        .plus(lockedBalanceInUsd)
        .plus(unrealizedPnLInUsd)
        .plus(availableBalanceInUsd)
    },

    totalToString(): string {
      const { total } = this

      return total.toFormat(UI_DEFAULT_MIN_DISPLAY_DECIMALS)
    }
  }
})
</script>
