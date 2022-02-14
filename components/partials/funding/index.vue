<template>
  <div>
    <v-welcome-banner />
    <v-new-user-banner class="mt-6" />

    <div class="border-b border-gray-500 w-full my-4"></div>

    <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <v-card-select v-model="component" lg :option="components.bankAccount">
        <template slot="subtitle">
          <div class="font-semibold text-lg flex items-center mb-4">
            <span>{{ $t('wallet.bankAccount') }}</span>
            <v-icon-info-tooltip
              class="ml-3"
              color="text-gray-200"
              :tooltip="$t('wallet.bankAccountTooltip')"
              lg
            />
          </div>
        </template>
        <div class="text-right tracking-wider">
          <p class="text-gray-500 text-xs uppercase mb-3">
            {{ $t('wallet.portfolioValue') }}
          </p>
          <p class="text-2xl">{{ bankAccountBalanceToString }} USD</p>
        </div>
      </v-card-select>

      <v-card-select v-model="component" lg :option="components.tradingAccount">
        <template slot="subtitle">
          <div class="font-semibold text-lg flex items-center mb-4">
            <span>{{ $t('wallet.tradingAccount') }}</span>
            <v-icon-info-tooltip
              class="ml-3"
              color="text-gray-200"
              :tooltip="$t('wallet.tradingAccountTooltip')"
              lg
            />
          </div>
        </template>
        <div class="text-right tracking-wider">
          <p class="text-gray-500 text-xs uppercase mb-3">
            {{ $t('wallet.portfolioValue') }}
          </p>
          <p class="text-2xl">15,887.00 USD</p>
        </div>
      </v-card-select>
    </div>

    <div class="w-full">
      <v-panel :title="$t('balances')" class="mt-6">
        <v-balances :status="status" :balances="bankAccountBalances" />
      </v-panel>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { BigNumberInBase, Status } from '@injectivelabs/utils'
import { BankBalanceWithTokenAndBalanceWithUsdBalance } from '@injectivelabs/ui-common'
import VBalances from '~/components/partials/funding/balances/index.vue'
import VWelcomeBanner from '~/components/partials/banners/welcome.vue'
import VNewUserBanner from '~/components/partials/banners/new-user.vue'
import {
  UI_MINIMAL_AMOUNT,
  UI_DEFAULT_MIN_DISPLAY_DECIMALS
} from '~/app/utils/constants'

const components = {
  bankAccount: 'bank-account',
  tradingAccount: 'trading-account'
}

export default Vue.extend({
  components: {
    VBalances,
    VNewUserBanner,
    VWelcomeBanner
  },

  props: {
    bankAccountBalances: {
      type: Array as PropType<BankBalanceWithTokenAndBalanceWithUsdBalance[]>,
      required: true
    },

    bankAccountBalance: {
      type: Object as PropType<BigNumberInBase>,
      required: true
    },

    status: {
      type: Object as PropType<Status>,
      default: () => new Status()
    }
  },

  data() {
    return {
      components,
      component: components.bankAccount
    }
  },

  computed: {
    bankAccountBalanceToString(): string {
      const { bankAccountBalance } = this

      if (bankAccountBalance.eq(0)) {
        return '0.00'
      }

      if (bankAccountBalance.lte(UI_MINIMAL_AMOUNT)) {
        return `< ${UI_MINIMAL_AMOUNT.toFormat(
          UI_DEFAULT_MIN_DISPLAY_DECIMALS
        )}`
      }

      return bankAccountBalance.toFormat(UI_DEFAULT_MIN_DISPLAY_DECIMALS)
    }
  }
})
</script>
