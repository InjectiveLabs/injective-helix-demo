<template>
  <div>
    <h4 class="text-sm uppercase text-gray-400">
      {{ $t('funding.accountSummary') }}
    </h4>
    <div
      class="flex flex-wrap items-center justify-center lg:justify-between mt-4"
    >
      <div
        class="flex font-mono items-end flex-wrap justify-center lg:justify-start"
      >
        <h2 class="text-white text-2xl sm:text-3xl xl:text-4xl mr-4">
          {{ totalBalanceToString }} USD
        </h2>
        <span class="text-2xl text-gray-400 mt-4 lg:mt-0">
          {{ totalBalanceInBtcToString }} BTC
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
import { BigNumberInBase } from '@injectivelabs/utils'
import { ZERO_IN_BASE } from '@injectivelabs/ui-common'
import {
  UI_MINIMAL_AMOUNT,
  UI_DEFAULT_MIN_DISPLAY_DECIMALS
} from '~/app/utils/constants'

export default Vue.extend({
  props: {
    totalBalance: {
      type: Object as PropType<BigNumberInBase>,
      required: true
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

      if (totalBalanceInBtc.lte('0.001')) {
        return '< 0.001'
      }

      if (totalBalanceInBtc.lte('0.01')) {
        return '< 0.01'
      }

      return totalBalanceInBtc.toFormat(UI_DEFAULT_MIN_DISPLAY_DECIMALS)
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
    }
  }
})
</script>
