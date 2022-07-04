<template>
  <tr data-cy="wallet-history-table-row">
    <td class="h-8 font-mono">
      <span
        class="text-gray-400 text-xs"
        data-cy="wallet-history-time-table-data"
      >
        {{ time }}
      </span>
    </td>

    <td class="h-8 text-left">
      <span data-cy="wallet-history-operation-type-table-data">{{
        transferType
      }}</span>
    </td>

    <td class="h-8 text-left cursor-pointer">
      <div class="flex items-center justify-start">
        <div v-if="transaction.token" class="w-6 h-6">
          <img
            :src="tokenLogo"
            :alt="transaction.token.name"
            class="min-w-full h-auto rounded-full"
          />
        </div>
        <div class="ml-3">
          <span
            class="text-gray-200 font-semibold"
            data-cy="wallet-history-asset-table-data"
          >
            {{ transaction.token.symbol }}
          </span>
        </div>
      </div>
    </td>

    <td class="h-8 text-right font-mono">
      <VNumber
        :decimals="UI_DEFAULT_MIN_DISPLAY_DECIMALS"
        :number="amount"
        :rounding-mode="BIG_NUMBER_ROUND_HALF_UP_MODE"
        data-cy="wallet-history-amount-table-data"
      >
        <span slot="addon" class="text-2xs text-gray-500">
          {{ transaction.token.symbol }}
        </span>
      </VNumber>
    </td>

    <td class="h-8 text-left font-mono">
      <VAddress
        :address="transaction.sender"
        data-cy="wallet-history-sender-table-data"
      >
        {{ formattedOrigin }}
      </VAddress>
    </td>

    <td class="h-8 text-left font-mono">
      <VAddress
        :address="transaction.receiver"
        data-cy="wallet-history-receiver-table-data"
      >
        {{ formattedDestination }}
      </VAddress>
    </td>

    <td class="text-right">
      <a
        :href="transaction.explorerLink"
        data-cy="history-entry-explorer-link"
        target="_blank"
        class="text-primary-500 cursor-pointer pr-2"
      >
        {{ $t('common.view') }}
      </a>
    </td>
  </tr>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import {
  BigNumberInBase,
  BigNumberInWei,
  formatWalletAddress
} from '@injectivelabs/utils'
import { format } from 'date-fns'
import {
  UiBridgeTransactionWithToken,
  ZERO_IN_BASE,
  getTokenLogoWithVendorPathPrefix
} from '@injectivelabs/sdk-ui-ts'
import {
  BIG_NUMBER_ROUND_HALF_UP_MODE,
  UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS,
  UI_DEFAULT_PRICE_DISPLAY_DECIMALS,
  UI_DEFAULT_MIN_DISPLAY_DECIMALS
} from '~/app/utils/constants'
import VAddress from '~/components/partials/activity/wallet-history/common/address.vue'

export default Vue.extend({
  components: {
    VAddress
  },

  props: {
    transaction: {
      required: true,
      type: Object as PropType<UiBridgeTransactionWithToken>
    }
  },

  data() {
    return {
      BIG_NUMBER_ROUND_HALF_UP_MODE,
      UI_DEFAULT_MIN_DISPLAY_DECIMALS,
      UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS,
      UI_DEFAULT_PRICE_DISPLAY_DECIMALS
    }
  },

  computed: {
    formattedOrigin(): string {
      const { transaction } = this

      return formatWalletAddress(transaction.sender)
    },

    formattedDestination(): string {
      const { transaction } = this

      return formatWalletAddress(transaction.receiver)
    },

    amount(): BigNumberInBase {
      const { transaction } = this

      if (!transaction.amount) {
        return ZERO_IN_BASE
      }

      return new BigNumberInWei(transaction.amount).toBase(
        transaction.token.decimals
      )
    },

    transferType(): string {
      const { transaction } = this

      if (transaction.sender.startsWith('axelar')) {
        return this.$t('walletHistory.axelarDepositType')
      }

      if (transaction.sender.startsWith('chihuahua')) {
        return this.$t('walletHistory.chihuahuaDepositType')
      }

      if (transaction.sender.startsWith('cosmos')) {
        return this.$t('walletHistory.cosmosDepositType')
      }

      if (transaction.sender.startsWith('juno')) {
        return this.$t('walletHistory.junoDepositType')
      }

      if (transaction.sender.startsWith('osmo')) {
        return this.$t('walletHistory.osmosisDepositType')
      }

      if (transaction.sender.startsWith('terra')) {
        return this.$t('walletHistory.terraDepositType')
      }

      if (transaction.sender.startsWith('evmos')) {
        return this.$t('walletHistory.evmosDepositType')
      }

      if (
        transaction.sender.startsWith('inj') &&
        transaction.receiver.startsWith('inj')
      ) {
        return this.$t('walletHistory.INJTransferType')
      }

      return this.$t('walletHistory.ethDepositType')
    },

    time(): string {
      const { transaction } = this

      if (!transaction.timestamp) {
        return ''
      }

      return format(transaction.timestamp, 'dd MMM HH:mm:ss')
    },

    tokenLogo(): string {
      const { transaction } = this

      return getTokenLogoWithVendorPathPrefix(transaction.token.logo)
    }
  }
})
</script>
