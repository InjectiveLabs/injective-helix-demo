<script setup lang="ts">
import { injToken } from '@shared/data/token'
import { BigNumberInBase } from '@injectivelabs/utils'
import { TokenType, TokenVerification } from '@injectivelabs/sdk-ts'
import { sharedToBalanceInTokenInBase } from '@shared/utils/formatter'
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

const isStakingVisible = ref(false)

const hasCw20Balance = computed(() => {
  const cw20Address = getCw20AddressFromDenom(props.balance.denom)

  if (!cw20Address) {
    return false
  }

  return new BigNumberInBase(accountStore.cw20BalancesMap[cw20Address] || 0).gt(
    0
  )
})

const { valueToString: availableAmountToString } = useSharedBigNumberFormatter(
  computed(() =>
    sharedToBalanceInTokenInBase({
      value: props.balance.availableMargin,
      decimalPlaces: props.balance.token.decimals
    })
  ),
  { decimalPlaces: UI_DEFAULT_DISPLAY_DECIMALS }
)

const { valueToString: totalAmountInUsdToString } = useSharedBigNumberFormatter(
  computed(() =>
    sharedToBalanceInTokenInBase({
      value: props.balance.accountTotalBalanceInUsd,
      decimalPlaces: props.balance.token.decimals
    })
  ),
  { decimalPlaces: UI_DEFAULT_DISPLAY_DECIMALS }
)

const { valueToString: totalAmountToString } = useSharedBigNumberFormatter(
  computed(() =>
    sharedToBalanceInTokenInBase({
      value: props.balance.accountTotalBalance,
      decimalPlaces: props.balance.token.decimals
    })
  ),
  { decimalPlaces: UI_DEFAULT_DISPLAY_DECIMALS }
)

const {
  valueToString: reservedToString,
  valueToBigNumber: reservedToBigNumber
} = useSharedBigNumberFormatter(
  computed(() =>
    sharedToBalanceInTokenInBase({
      value: props.balance.inOrderBalance,
      decimalPlaces: props.balance.token.decimals
    })
  ),
  { decimalPlaces: UI_DEFAULT_DISPLAY_DECIMALS }
)

const {
  valueToString: unrealizedPnlToString,
  valueToBigNumber: unrealizedToBigNumber
} = useSharedBigNumberFormatter(
  computed(() =>
    sharedToBalanceInTokenInBase({
      value: props.balance.unrealizedPnl,
      decimalPlaces: props.balance.token.decimals
    })
  ),
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

function toggleStakingRow() {
  isStakingVisible.value = !isStakingVisible.value
}
</script>

<template>
  <div>
    <div class="p-2 grid grid-cols-8">
      <div
        v-if="balance.token"
        class="flex items-center space-x-4 shrink-0 p-2"
      >
        <CommonTokenIcon v-bind="{ token: balance.token }" />
        <div>
          <p class="font-medium">{{ balance.token.symbol }}</p>
          <p class="text-xs text-gray-500">{{ balance.token.name }}</p>
        </div>

        <button
          v-if="balance.denom === injToken.denom"
          @click="toggleStakingRow"
        >
          <SharedIcon
            name="chevron"
            is-lg
            class="p-3 text-gray-400 hover:text-white"
            :class="{
              'rotate-90': isStakingVisible,
              '-rotate-90': !isStakingVisible
            }"
          />
        </button>
      </div>

      <div class="shrink-0 flex items-center font-mono text-xs p-2 justify-end">
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

      <div class="shrink-0 flex items-center font-mono text-xs p-2 justify-end">
        <CommonSkeletonSubaccountAmount>
          <span v-if="reservedToBigNumber.eq(0)">&mdash;</span>
          <span v-else>
            {{ reservedToString }}
          </span>
        </CommonSkeletonSubaccountAmount>
      </div>

      <div class="shrink-0 flex items-center font-mono text-xs p-2 justify-end">
        <CommonSkeletonSubaccountAmount>
          <span v-if="unrealizedToBigNumber.eq(0)"> - </span>
          <span v-else>
            {{ unrealizedPnlToString }}
          </span>
        </CommonSkeletonSubaccountAmount>
      </div>

      <div class="shrink-0 flex items-center font-mono text-xs p-2 justify-end">
        <CommonSkeletonSubaccountAmount>
          {{ totalAmountToString }}
        </CommonSkeletonSubaccountAmount>
      </div>

      <div class="flex items-center font-mono text-xs shrink-0 p-2 justify-end">
        <div class="space-y-1">
          <CommonSkeletonSubaccountAmount>
            ${{ totalAmountInUsdToString }}
          </CommonSkeletonSubaccountAmount>
        </div>
      </div>

      <div
        class="flex col-span-2 items-center font-mono text-xs space-x-2 shrink-0 p-2 pl-4 justify-end"
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

    <AppCollapse
      v-if="balance.denom === injToken.denom"
      :is-open="isStakingVisible"
    >
      <PartialsPortfolioBalancesSubaccountTableStakingRow
        v-if="balance.denom === injToken.denom"
      />
    </AppCollapse>
  </div>
</template>
