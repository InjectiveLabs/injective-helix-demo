<template>
  <tr>
    <td class="h-8 font-mono">
      <span class="text-gray-400 text-xs">{{ time }}</span>
    </td>

    <td class="h-8 text-left cursor-pointer">
      <div class="flex items-center justify-end md:justify-start">
        <div v-if="transfer.token" class="w-6 h-6">
          <img
            :src="transfer.token.logo"
            :alt="transfer.token.name"
            class="min-w-full h-auto rounded-full"
          />
        </div>
        <div class="ml-3">
          <span class="text-gray-200 font-semibold">
            {{ transfer.token.symbol }}
          </span>
        </div>
      </div>
    </td>

    <td class="h-8 text-left">
      <span>{{
        $t(
          `fundingHistory.${
            transfer.transferType === TransferType.Deposit
              ? 'subaccountDepositType'
              : 'subaccountWithdrawalType'
          }`
        )
      }}</span>
    </td>

    <td class="h-8 text-right font-mono">
      <v-number :decimals="UI_DEFAULT_MIN_DISPLAY_DECIMALS" :number="amount">
        <span slot="addon" class="text-2xs text-gray-500">
          {{ transfer.token.symbol }}
        </span>
      </v-number>
    </td>

    <td class="h-8 text-left font-mono">
      <v-address :address="origin"> {{ formattedOrigin }}</v-address>
    </td>

    <td class="h-8 text-left font-mono">
      <v-address :address="destination">{{ formattedDestination }}</v-address>
    </td>

    <td class="text-right">
      <a
        :href="explorerUrl"
        target="_blank"
        class="text-primary-500 cursor-pointer"
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
import { TransferType } from '@injectivelabs/subaccount-consumer'
import {
  UiDerivativeMarketWithToken,
  UiSubaccountTransferWithToken,
  ZERO_IN_BASE,
  getExplorerUrl
} from '@injectivelabs/ui-common'
import {
  UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS,
  UI_DEFAULT_PRICE_DISPLAY_DECIMALS,
  UI_DEFAULT_MIN_DISPLAY_DECIMALS,
  NETWORK
} from '~/app/utils/constants'
import VAddress from '~/components/partials/activities/funding/common/address.vue'

export default Vue.extend({
  components: {
    VAddress
  },

  props: {
    transfer: {
      required: true,
      type: Object as PropType<UiSubaccountTransferWithToken>
    }
  },

  data() {
    return {
      UI_DEFAULT_MIN_DISPLAY_DECIMALS,
      UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS,
      UI_DEFAULT_PRICE_DISPLAY_DECIMALS,
      TransferType
    }
  },

  computed: {
    currentMarket(): UiDerivativeMarketWithToken | undefined {
      return this.$accessor.derivatives.market
    },

    markets(): UiDerivativeMarketWithToken[] {
      return this.$accessor.derivatives.markets
    },

    origin(): string {
      const { transfer } = this

      if (transfer.transferType === TransferType.Deposit) {
        return transfer.srcSubaccountAddress
      }

      return transfer.srcSubaccountId
    },

    formattedOrigin(): string {
      const { origin } = this

      return formatWalletAddress(origin)
    },

    destination(): string {
      const { transfer } = this

      if (transfer.transferType === TransferType.Deposit) {
        return transfer.dstSubaccountId
      }

      return transfer.dstSubaccountAddress
    },

    formattedDestination(): string {
      const { destination } = this

      return formatWalletAddress(destination)
    },

    amount(): BigNumberInBase {
      const { transfer } = this

      if (!transfer.amount) {
        return ZERO_IN_BASE
      }

      return new BigNumberInWei(transfer.amount).toBase(transfer.token.decimals)
    },

    explorerUrl(): string {
      const { transfer } = this

      const injectiveAddress =
        transfer.transferType === TransferType.Deposit
          ? transfer.srcSubaccountAddress
          : transfer.dstSubaccountAddress

      return `${getExplorerUrl(NETWORK)}/account/${injectiveAddress}`
    },

    time(): string {
      const { transfer } = this

      if (!transfer.executedAt) {
        return ''
      }

      return format(transfer.executedAt, 'dd MMM HH:mm:ss')
    }
  }
})
</script>
