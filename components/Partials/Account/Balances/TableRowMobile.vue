<script lang="ts" setup>
import { PropType } from 'vue'
import { getTokenLogoWithVendorPathPrefix } from '@injectivelabs/sdk-ui-ts'
import {
  HIDDEN_BALANCE_DISPLAY,
  UI_DEFAULT_DISPLAY_DECIMALS
} from '@/app/utils/constants'
import { AccountBalance, BusEvents, Modal } from '@/types'

const props = defineProps({
  balance: {
    type: Object as PropType<AccountBalance>,
    required: true
  },

  hideBalances: {
    type: Boolean,
    required: true
  }
})

const modalStore = useModalStore()

const isOpen = ref(false)

const tokenLogo = computed(() => {
  return getTokenLogoWithVendorPathPrefix(props.balance.token.logo)
})

const totalBalance = computed(() => {
  return props.balance.bankBalance.plus(
    props.balance.subaccountAvailableBalance
  )
})

const { valueToString: totalBalanceInUsdToString } =
  useBigNumberFormatter(totalBalance)

const combinedBalance = computed(() => {
  return props.balance.bankBalance.plus(
    props.balance.subaccountAvailableBalance
  )
})

const { valueToString: combinedBalanceToString } = useBigNumberFormatter(
  combinedBalance,
  {
    decimalPlaces: UI_DEFAULT_DISPLAY_DECIMALS
  }
)

function handleOpenAssetDetailsModal() {
  useEventBus<AccountBalance>(BusEvents.AssetDetailsModalPayload).emit(
    props.balance
  )

  modalStore.openModal({
    type: Modal.AssetDetails,
    preventScroll: true
  })
}
</script>

<template>
  <tr
    class="border-b border-gray-700 last-of-type:border-b-transparent hover:bg-gray-700 bg-transparent overflow-hidden gap-2 transition-all"
    :class="{
      'max-h-20': !isOpen,
      'max-h-screen': isOpen
    }"
    :data-cy="'wallet-balance-table-row-' + balance.token.symbol"
    @click="handleOpenAssetDetailsModal"
  >
    <td class="no-padding">
      <div class="flex flex-col py-4 pl-4">
        <div class="flex justify-start items-center gap-2">
          <div class="w-6 h-6 rounded-full self-start">
            <img :src="tokenLogo" :alt="balance.token.name" />
          </div>

          <div class="flex flex-col gap-1">
            <span
              class="text-white font-bold tracking-wide text-sm uppercase h-6 flex items-center"
              data-cy="wallet-balance-token-symbol-table-data"
            >
              {{ balance.token.symbol }}
            </span>
            <span class="text-gray-500 text-xs">
              {{ balance.token.name }}
            </span>
          </div>
        </div>
      </div>
    </td>

    <td class="no-padding">
      <div class="flex flex-col py-4">
        <div class="flex flex-col items-end gap-1">
          <div data-cy="wallet-balance-total-table-data">
            <span v-if="hideBalances" class="font-mono text-sm text-right">
              {{ HIDDEN_BALANCE_DISPLAY }}
            </span>

            <span v-else class="font-mono text-sm text-right">
              {{ combinedBalanceToString }}
            </span>
          </div>

          <div>
            <span v-if="hideBalances" class="font-mono text-sm text-right">
              {{ HIDDEN_BALANCE_DISPLAY }} USD
            </span>

            <span v-else class="font-mono text-sm text-right">
              {{ totalBalanceInUsdToString }} USD
            </span>
          </div>
        </div>
      </div>
    </td>

    <td class="no-padding">
      <div class="flex items-center justify-end px-4">
        <BaseIcon name="chevron" class="text-blue-500 w-4 h-4 rotate-180" />
      </div>
    </td>
  </tr>
</template>
