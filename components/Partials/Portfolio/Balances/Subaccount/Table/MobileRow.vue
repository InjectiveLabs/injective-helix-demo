<script setup lang="ts">
import { TokenType, TokenVerification } from '@injectivelabs/token-metadata'
import { BigNumberInWei } from '@injectivelabs/utils'
import { injToken } from '@shared/data/token'
import { INJ_DENOM } from '@shared/utils/constant'
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
  <div class="p-2">
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

    <div
      class="flex items-center text-xs p-2 space-x-2 border-b justify-between"
    >
      <p>{{ $t('portfolio.balances.available') }}:</p>

      <CommonSkeletonSubaccountAmount>
        <p class="flex items-center gap-1 font-mono">
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

    <div class="flex items-center text-xs p-2 justify-between border-b">
      <p>{{ $t('portfolio.balances.inUseReserved') }}:</p>

      <CommonSkeletonSubaccountAmount>
        <span v-if="reservedToBigNumber.eq(0)"> - </span>
        <span v-else class="font-mono">
          {{ reservedToString }}
        </span>
      </CommonSkeletonSubaccountAmount>
    </div>

    <div class="flex items-center text-xs p-2 justify-between border-b">
      <p>{{ $t('portfolio.balances.unrealizedPnl') }}:</p>

      <CommonSkeletonSubaccountAmount>
        <span v-if="unrealizedToBigNumber.eq(0)"> - </span>
        <span v-else class="font-mono">
          {{ unrealizedPnlToString }}
        </span>
      </CommonSkeletonSubaccountAmount>
    </div>

    <div class="flex items-center justify-between text-xs p-2 border-b">
      <p>{{ $t('portfolio.balances.total') }}:</p>

      <CommonSkeletonSubaccountAmount>
        <span class="font-mono">{{ totalAmountToString }}</span>
      </CommonSkeletonSubaccountAmount>
    </div>

    <div
      class="items-center text-xs shrink-0 p-2 flex justify-between border-b"
    >
      <p>{{ $t('portfolio.balances.totalValueUsd') }}:</p>

      <CommonSkeletonSubaccountAmount>
        <span class="font-mono">${{ totalAmountInUsdToString }}</span>
      </CommonSkeletonSubaccountAmount>
    </div>

    <CommonHeadlessTotalBalance v-if="balance.denom === INJ_DENOM">
      <template #default="{ stakedAmount, stakedAmountInUsd }">
        <div
          class="items-center text-xs shrink-0 p-2 flex justify-between border-b"
        >
          <p>{{ $t('trade.staked') }}:</p>

          <CommonSkeletonSubaccountAmount>
            <span class="font-mono">{{
              stakedAmount.toFormat(UI_DEFAULT_DISPLAY_DECIMALS)
            }}</span>
          </CommonSkeletonSubaccountAmount>
        </div>

        <div
          class="items-center text-xs shrink-0 p-2 flex justify-between border-b"
        >
          <p>{{ $t('trade.stakedUsd') }}:</p>

          <CommonSkeletonSubaccountAmount>
            <span class="font-mono">{{
              stakedAmountInUsd.toFormat(UI_DEFAULT_DISPLAY_DECIMALS)
            }}</span>
          </CommonSkeletonSubaccountAmount>
        </div>
      </template>
    </CommonHeadlessTotalBalance>

    <div
      class="flex-[3] flex items-center font-mono text-xs space-x-2 shrink-0 max-lg:pt-2 px-2"
    >
      <PartialsCommonBridgeRedirection
        v-if="isBridgable"
        v-bind="{
          isDeposit: true,
          denom: balance.token.denom
        }"
      >
        <AppButton variant="primary" size="sm">
          {{ $t('account.deposit') }}
        </AppButton>
      </PartialsCommonBridgeRedirection>

      <PartialsCommonBridgeRedirection
        v-if="isBridgable"
        v-bind="{
          denom: balance.token.denom
        }"
      >
        <AppButton variant="primary-outline" size="sm">
          {{ $t('account.withdraw') }}
        </AppButton>
      </PartialsCommonBridgeRedirection>

      <PartialsCommonBridgeRedirection
        v-bind="{
          denom: balance.token.denom,
          isTransfer: true
        }"
      >
        <AppButton variant="primary-outline" size="sm">
          {{ $t('account.transfer') }}
        </AppButton>
      </PartialsCommonBridgeRedirection>
    </div>
  </div>
</template>
