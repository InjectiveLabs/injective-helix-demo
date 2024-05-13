<script setup lang="ts">
import { BigNumberInWei } from '@injectivelabs/utils'
import { AccountBalance } from '@/types'
import { UI_DEFAULT_DISPLAY_DECIMALS } from '@/app/utils/constants'
import { getCw20AddressFromDenom } from '@/app/utils/helpers'

const accountStore = useAccountStore()

const props = defineProps({
  balance: {
    type: Object as PropType<AccountBalance>,
    required: true
  }
})

const hasCw20Balance = computed(() => {
  const cw20Address = getCw20AddressFromDenom(props.balance.denom)

  if (!cw20Address) {
    return false
  }

  return new BigNumberInWei(accountStore.cw20BalancesMap[cw20Address] || 0).gt(
    0
  )
})

const { valueToString: availableAmountToString } = useBigNumberFormatter(
  computed(() => {
    return new BigNumberInWei(props.balance.availableMargin).toBase(
      props.balance.token.decimals
    )
  }),
  { decimalPlaces: UI_DEFAULT_DISPLAY_DECIMALS }
)

const { valueToString: totalAmountInUsdToString } = useSharedBigNumberFormatter(
  computed(() => {
    return new BigNumberInWei(props.balance.accountTotalBalanceInUsd).toBase(
      props.balance.token.decimals
    )
  }),
  { decimalPlaces: UI_DEFAULT_DISPLAY_DECIMALS }
)

const { valueToString: totalAmountToString } = useSharedBigNumberFormatter(
  computed(() => {
    return new BigNumberInWei(props.balance.accountTotalBalance).toBase(
      props.balance.token.decimals
    )
  }),
  { decimalPlaces: UI_DEFAULT_DISPLAY_DECIMALS }
)

const {
  valueToString: reservedToString,
  valueToBigNumber: reservedToBigNumber
} = useSharedBigNumberFormatter(
  computed(() => {
    return new BigNumberInWei(props.balance.inOrderBalance).toBase(
      props.balance.token.decimals
    )
  }),
  { decimalPlaces: UI_DEFAULT_DISPLAY_DECIMALS }
)

const {
  valueToString: unrealizedPnlToString,
  valueToBigNumber: unrealizedToBigNumber
} = useSharedBigNumberFormatter(
  computed(() => {
    return new BigNumberInWei(props.balance.unrealizedPnl).toBase(
      props.balance.token.decimals
    )
  }),
  { decimalPlaces: UI_DEFAULT_DISPLAY_DECIMALS }
)
</script>

<template>
  <div class="flex p-2">
    <div
      v-if="balance.token"
      class="flex-[2] flex items-center space-x-4 shrink-0 p-2"
    >
      <CommonTokenIcon v-bind="{ token: balance.token }" />
      <div>
        <p class="font-medium">{{ balance.token.symbol }}</p>
        <p class="text-xs text-gray-500">{{ balance.token.name }}</p>
      </div>
    </div>

    <div class="shrink-0 flex-[2] flex items-center font-mono text-xs p-2">
      <CommonSkeletonSubaccountAmount>
        <p class="flex items-center gap-1">
          {{ availableAmountToString }}

          <span
            v-if="hasCw20Balance"
            class="text-xs text-gray-400 font-semibold"
          >
            <AppTooltip
              class="ml-2 text-gray-200"
              :content="$t('account.balanceIncludesCw20Balance')"
            />
          </span>
        </p>
      </CommonSkeletonSubaccountAmount>
    </div>

    <div class="shrink-0 flex-[2] flex items-center font-mono text-xs p-2">
      <CommonSkeletonSubaccountAmount>
        <span v-if="reservedToBigNumber.eq(0)"> - </span>
        <span v-else>
          {{ reservedToString }}
        </span>
      </CommonSkeletonSubaccountAmount>
    </div>

    <div class="shrink-0 flex-[2] flex items-center font-mono text-xs p-2">
      <CommonSkeletonSubaccountAmount>
        <span v-if="unrealizedToBigNumber.eq(0)"> - </span>
        <span v-else>
          {{ unrealizedPnlToString }}
        </span>
      </CommonSkeletonSubaccountAmount>
    </div>

    <div class="shrink-0 flex-[2] flex items-center font-mono text-xs p-2">
      <CommonSkeletonSubaccountAmount>
        {{ totalAmountToString }}
      </CommonSkeletonSubaccountAmount>
    </div>

    <div class="flex-[2] flex items-center font-mono text-xs shrink-0 p-2">
      <div class="space-y-1">
        <CommonSkeletonSubaccountAmount>
          $ {{ totalAmountInUsdToString }}
        </CommonSkeletonSubaccountAmount>
      </div>
    </div>

    <div
      class="flex-[3] flex items-center font-mono text-xs space-x-2 shrink-0 p-2"
    >
      <AppButton
        variant="primary"
        class="bg-gray-500 hover:bg-gray-500/80 border-gray-500 hover:border-gray-500"
        size="sm"
      >
        Withdraw
      </AppButton>
      <AppButton
        variant="primary"
        class="bg-gray-500 hover:bg-gray-500/80 border-gray-500 hover:border-gray-500"
        size="sm"
      >
        Deposit
      </AppButton>
      <AppButton
        variant="primary"
        class="bg-gray-500 hover:bg-gray-500/80 border-gray-500 hover:border-gray-500"
        size="sm"
      >
        Transfer
      </AppButton>
    </div>
  </div>
</template>
