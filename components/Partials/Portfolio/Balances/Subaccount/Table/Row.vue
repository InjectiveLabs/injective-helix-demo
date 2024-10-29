<script setup lang="ts">
import { injToken } from '@shared/data/token'
import { Wallet } from '@injectivelabs/wallet-ts'
import { BigNumberInBase } from '@injectivelabs/utils'
import { TokenType, TokenVerification } from '@injectivelabs/sdk-ts'
import { sharedToBalanceInTokenInBase } from '@shared/utils/formatter'
import { NuxtUiIcons } from '@shared/types'
import { UI_DEFAULT_DISPLAY_DECIMALS } from '@/app/utils/constants'
import { getCw20AddressFromDenom } from '@/app/utils/helpers'
import { Modal, BusEvents, AccountBalance, PortfolioSubPage } from '@/types'

const modalStore = useModalStore()
const accountStore = useAccountStore()
const sharedWalletStore = useSharedWalletStore()

const props = withDefaults(
  defineProps<{
    balance: AccountBalance
  }>(),
  {}
)

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

const { valueToFixed: availableAmountToFixed } = useSharedBigNumberFormatter(
  computed(() =>
    sharedToBalanceInTokenInBase({
      value: props.balance.availableMargin,
      decimalPlaces: props.balance.token.decimals
    })
  ),
  { decimalPlaces: UI_DEFAULT_DISPLAY_DECIMALS }
)

const { valueToFixed: totalAmountInUsdToFixed } = useSharedBigNumberFormatter(
  computed(() =>
    sharedToBalanceInTokenInBase({
      value: props.balance.accountTotalBalanceInUsd,
      decimalPlaces: props.balance.token.decimals
    })
  ),
  { decimalPlaces: 18 }
)

const { valueToFixed: totalAmountToFixed } = useSharedBigNumberFormatter(
  computed(() =>
    sharedToBalanceInTokenInBase({
      value: props.balance.accountTotalBalance,
      decimalPlaces: props.balance.token.decimals
    })
  ),
  { decimalPlaces: UI_DEFAULT_DISPLAY_DECIMALS }
)

const { valueToFixed: reservedToFixed, valueToBigNumber: reservedToBigNumber } =
  useSharedBigNumberFormatter(
    computed(() =>
      sharedToBalanceInTokenInBase({
        value: props.balance.inOrderBalance,
        decimalPlaces: props.balance.token.decimals
      })
    ),
    { decimalPlaces: UI_DEFAULT_DISPLAY_DECIMALS }
  )

const {
  valueToFixed: unrealizedPnlToFixed,
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

function onFiatOnRamp() {
  modalStore.openModal(Modal.FiatOnboard)
}

function onTransfer() {
  modalStore.openModal(Modal.BankTransfer)
  useEventBus(BusEvents.BankTranksferModalWithDenom).emit(props.balance.denom)
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
          <p class="text-xs text-coolGray-500">{{ balance.token.name }}</p>
        </div>

        <button
          v-if="balance.denom === injToken.denom"
          @click="toggleStakingRow"
        >
          <UIcon
            :name="NuxtUiIcons.ChevronDown"
            size="xs"
            class="text-coolGray-400 hover:text-white"
            :class="{
              '-rotate-180': !isStakingVisible
            }"
          />
        </button>
      </div>

      <div class="shrink-0 flex items-center font-mono text-xs p-2 justify-end">
        <CommonSkeletonSubaccountAmount>
          <p class="flex items-center gap-1">
            <AppAmount
              v-bind="{
                amount: availableAmountToFixed
              }"
            />

            <span
              v-if="hasCw20Balance"
              class="text-xs text-coolGray-400 font-semibold"
            >
              <AppTooltip
                class="ml-2 text-coolGray-200"
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
            <AppAmount
              v-bind="{
                showZeroAsEmDash: true,
                amount: reservedToFixed
              }"
            />
          </span>
        </CommonSkeletonSubaccountAmount>
      </div>

      <div class="shrink-0 flex items-center font-mono text-xs p-2 justify-end">
        <CommonSkeletonSubaccountAmount>
          <span v-if="unrealizedToBigNumber.eq(0)"> &mdash; </span>
          <span v-else>
            <AppAmount
              v-bind="{
                showZeroAsEmDash: true,
                amount: unrealizedPnlToFixed
              }"
            />
          </span>
        </CommonSkeletonSubaccountAmount>
      </div>

      <div class="shrink-0 flex items-center font-mono text-xs p-2 justify-end">
        <CommonSkeletonSubaccountAmount>
          <AppAmount
            v-bind="{
              amount: totalAmountToFixed
            }"
          />
        </CommonSkeletonSubaccountAmount>
      </div>

      <div class="flex items-center font-mono text-xs shrink-0 p-2 justify-end">
        <div class="flex items-center">
          <CommonSkeletonSubaccountAmount>
            <span class="mr-1">$</span>
            <AppUsdAmount
              v-bind="{
                amount: totalAmountInUsdToFixed
              }"
            />
          </CommonSkeletonSubaccountAmount>
        </div>
      </div>

      <div
        class="flex col-span-2 items-center justify-end font-mono text-xs p-2 pl-4"
      >
        <div
          v-if="accountStore.isDefaultSubaccount"
          class="space-x-2 shrink-0 flex"
        >
          <template v-if="sharedWalletStore.wallet !== Wallet.Magic">
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
          </template>

          <template v-else>
            <AppButton size="sm" @click="onFiatOnRamp">
              {{ $t('account.deposit') }}
            </AppButton>

            <AppButton variant="primary-outline" size="sm" @click="onTransfer">
              {{ $t('account.transfer') }}
            </AppButton>
          </template>
        </div>

        <NuxtLink
          v-else-if="!accountStore.isSgtSubaccount"
          :to="{ name: PortfolioSubPage.Subaccounts }"
        >
          <AppButton variant="primary" size="sm">
            {{ $t('account.transfer') }}
          </AppButton>
        </NuxtLink>
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
