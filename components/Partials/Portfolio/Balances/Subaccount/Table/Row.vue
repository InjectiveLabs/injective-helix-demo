<script setup lang="ts">
import { TokenType, TokenVerification } from '@injectivelabs/token-metadata'
import { BigNumberInWei } from '@injectivelabs/utils'
import { injToken } from '@shared/data/token'
import { UI_DEFAULT_DISPLAY_DECIMALS } from '@/app/utils/constants'
import { getCw20AddressFromDenom } from '@/app/utils/helpers'
import { AccountBalance } from '@/types'

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

const isBridgable = computed(() => {
  if (props.balance.token.tokenType === TokenType.Ibc) {
    return props.balance.isVerified
  }

  return (
    (props.balance.token.tokenType === TokenType.Erc20 &&
      props.balance.token.tokenVerification === TokenVerification.Verified) ||
    props.balance.token.denom === injToken.denom
  )
})
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
      <PartialsAccountBridgeRedirection
        v-bind="{
          isDeposit: true,
          denom: balance.token.denom
        }"
      >
        <AppButton
          variant="primary"
          :class="{
            invisible: !isBridgable
          }"
          size="sm"
        >
          {{ $t('account.deposit') }}
        </AppButton>
      </PartialsAccountBridgeRedirection>

      <PartialsAccountBridgeRedirection
        v-bind="{
          denom: balance.token.denom
        }"
      >
        <AppButton
          variant="primary-outline"
          :class="{
            invisible: !isBridgable
          }"
          size="sm"
        >
          {{ $t('account.withdraw') }}
        </AppButton>
      </PartialsAccountBridgeRedirection>

      <PartialsAccountBridgeRedirection
        v-bind="{
          denom: balance.token.denom,
          isTransfer: true
        }"
      >
        <AppButton variant="primary-outline" size="sm">
          {{ $t('account.transfer') }}
        </AppButton>
      </PartialsAccountBridgeRedirection>
    </div>
  </div>
</template>
