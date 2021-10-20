<template>
  <tr>
    <td class="h-8 text-left cursor-pointer">
      {{ subaccountId }}
    </td>
    <td class="h-8 text-right font-mono">
      {{ amountToFormat }}
      <span class="text-xs text-gray-500 ml-1">
        {{ transfer.token.symbol }}
      </span>
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
      <span class="text-gray-400 text-xs">{{ time }}</span>
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
import { UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS } from '~/app/utils/constants'
import { TransferType, UiSubaccountTransfer } from '~/types'

export default Vue.extend({
  props: {
    transfer: {
      required: true,
      type: Object as PropType<UiSubaccountTransfer>
    }
  },

  data() {
    return {
      TransferType
    }
  },

  computed: {
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

      return new BigNumberInWei(transfer.amount.amount).toBase(
        transfer.token.decimals
      )
    },

    amountToFormat(): string {
      const { amount } = this

      return amount.toFormat(UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS)
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
        ? this.$t('deposit')
        : this.$t('withdraw')
    }
  }
})
</script>
