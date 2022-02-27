<template>
  <tr>
    <td class="h-8 font-mono">
      <span class="text-gray-400 text-xs">{{ time }}</span>
    </td>

    <td class="h-8 text-left font-mono">
      {{ subaccountId }}
    </td>

    <td class="h-8 text-center">
      <v-badge
        :aqua="transfer.transferType === TransferType.Deposit"
        :red="transfer.transferType === TransferType.Withdraw"
        sm
      >
        {{ transferType }}
      </v-badge>
    </td>

    <td class="h-8 text-right font-mono">
      <v-number
        :class="{
          'text-aqua-500': transfer.transferType === TransferType.Deposit,
          'text-red-500': transfer.transferType === TransferType.Withdraw
        }"
        :decimals="UI_DEFAULT_MIN_DISPLAY_DECIMALS"
        :number="amount"
      >
        <span slot="addon" class="text-2xs text-gray-500">
          {{ transfer.token.symbol }}
        </span>
      </v-number>
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
  ZERO_IN_BASE
} from '@injectivelabs/ui-common'
import {
  UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS,
  UI_DEFAULT_PRICE_DISPLAY_DECIMALS,
  UI_DEFAULT_MIN_DISPLAY_DECIMALS
} from '~/app/utils/constants'

export default Vue.extend({
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

    subaccountId(): string {
      const { transfer } = this

      if (transfer.transferType === TransferType.Deposit) {
        return formatWalletAddress(transfer.dstSubaccountId)
      }

      if (transfer.transferType === TransferType.Withdraw) {
        return formatWalletAddress(transfer.dstSubaccountAddress)
      }

      return formatWalletAddress(transfer.dstSubaccountId)
    },

    amount(): BigNumberInBase {
      const { transfer } = this

      if (!transfer.amount) {
        return ZERO_IN_BASE
      }

      return new BigNumberInWei(transfer.amount).toBase(transfer.token.decimals)
    },

    time(): string {
      const { transfer } = this

      if (!transfer.executedAt) {
        return ''
      }

      return format(transfer.executedAt, 'dd MMM HH:mm:ss')
    },

    transferType(): string {
      const { transfer } = this

      return transfer.transferType === TransferType.Deposit
        ? this.$t('fundingHistory.transfers.in')
        : this.$t('fundingHistory.transfers.out')
    }
  },

  methods: {
    //
  }
})
</script>
