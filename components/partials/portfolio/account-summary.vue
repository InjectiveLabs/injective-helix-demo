<template>
  <div>
    <div class="flex items-center cursor-pointer" @click="toggleHideBalance">
      <h4 class="text-sm uppercase text-gray-400">
        {{ $t('portfolio.accountSummary') }}
      </h4>
      <v-icon-show class="w-4 h-4 ml-4 text-gray-400 hover:text-primary-500" />
    </div>
    <div
      class="flex flex-wrap items-center justify-center lg:justify-between mt-4"
    >
      <div
        class="flex tracking-wide items-end flex-wrap justify-center lg:justify-start"
      >
        <h2 class="text-white text-2xl sm:text-3xl xl:text-4xl mr-4">
          <span v-if="hideBalance">{{ HIDDEN_BALANCE_DISPLAY }} </span>
          <span v-else-if="status.isLoading()">&mdash; USD </span>
          <span v-else>{{ totalBalanceToString }} USD</span>
        </h2>
        <span v-if="!hideBalance" class="text-2xl text-gray-400 mt-4 lg:mt-0">
          <span v-if="status.isIdle()">
            ≈ {{ totalBalanceInBtcToString }} BTC
          </span>
        </span>
      </div>
      <div class="flex items-center mt-6 lg:mt-0">
        <v-button outline md class="mr-6" @click="handleDepositClick">
          <span class="text-primary-500">{{ $t('common.deposit') }}</span>
        </v-button>
        <v-button outline md class="mr-4" @click="handleWithdrawClick">
          <span class="text-primary-500">{{ $t('common.withdraw') }}</span>
        </v-button>
        <v-button outline md @click="handleTransferClick">
          <span class="text-primary-500">{{ $t('common.transfer') }}</span>
        </v-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { Status, BigNumberInBase } from '@injectivelabs/utils'

import { ZERO_IN_BASE } from '@injectivelabs/ui-common'
import {
  HIDDEN_BALANCE_DISPLAY,
  UI_MINIMAL_AMOUNT,
  UI_DEFAULT_DISPLAY_DECIMALS,
  UI_DEFAULT_MIN_DISPLAY_DECIMALS
} from '~/app/utils/constants'

export default Vue.extend({
  props: {
    hideBalance: {
      type: Boolean,
      default: false
    },

    totalBalance: {
      type: Object as PropType<BigNumberInBase>,
      required: true
    },

    status: {
      required: false,
      type: Object as PropType<Status>,
      default: () => new Status()
    }
  },

  data() {
    return {
      HIDDEN_BALANCE_DISPLAY
    }
  },

  computed: {
    btcUsdPrice(): number {
      return this.$accessor.token.btcUsdPrice
    },

    totalBalanceToString(): string {
      const { totalBalance } = this

      if (totalBalance.eq(0)) {
        return '0.00'
      }

      if (totalBalance.lte(UI_MINIMAL_AMOUNT)) {
        return `< ${UI_MINIMAL_AMOUNT.toFormat(
          UI_DEFAULT_MIN_DISPLAY_DECIMALS
        )}`
      }

      return totalBalance.toFormat(UI_DEFAULT_MIN_DISPLAY_DECIMALS)
    },

    totalBalanceInBtc(): BigNumberInBase {
      const { totalBalance, btcUsdPrice } = this

      if (!btcUsdPrice) {
        return ZERO_IN_BASE
      }

      return totalBalance.dividedBy(new BigNumberInBase(btcUsdPrice))
    },

    totalBalanceInBtcToString(): string {
      const { totalBalanceInBtc } = this

      if (totalBalanceInBtc.eq('0')) {
        return '0.00'
      }

      if (totalBalanceInBtc.lte('0.0001')) {
        return '< 0.0001'
      }

      return totalBalanceInBtc.toFormat(UI_DEFAULT_DISPLAY_DECIMALS)
    }
  },

  methods: {
    handleDepositClick() {
      this.$root.$emit('bridge:deposit')
    },

    handleWithdrawClick() {
      this.$root.$emit('bridge:withdraw')
    },

    handleTransferClick() {
      this.$root.$emit('bridge:transfer')
    },

    toggleHideBalance() {
      const { hideBalance } = this

      this.$emit('update:hide-balance', !hideBalance)
    }
  }
})
</script>
