<script setup lang="ts">
import { NuxtUiIcons } from '@shared/types'
import { Wallet } from '@injectivelabs/wallet-base'
import { BigNumberInBase } from '@injectivelabs/utils'
import { injToken, usdtToken } from '@shared/data/token'
import { ZERO_IN_BASE, DEFAULT_ASSET_DECIMALS } from '@shared/utils/constant'
import { Modal } from '@/types'

const appStore = useAppStore()
const accountStore = useAccountStore()
const modalStore = useSharedModalStore()
const sharedTokenStore = useSharedTokenStore()
const sharedWalletStore = useSharedWalletStore()
const { aggregatedSubaccountTotalBalanceInUsd } = useBalance()

const accountTotalBalanceInInj = computed(() => {
  const injUsdPrice = sharedTokenStore.tokenUsdPrice(injToken)

  if (!injUsdPrice) {
    return ZERO_IN_BASE
  }

  return aggregatedSubaccountTotalBalanceInUsd.value.dividedBy(injUsdPrice)
})

const showNeptune = computed(() => {
  if (sharedWalletStore.isAuthzWalletConnected) {
    return false
  }

  const hasNeptuneUsdtBalance = new BigNumberInBase(
    accountStore.neptuneUsdtInBankBalance
  ).gt(0)

  const hasPeggyUsdtBalance = new BigNumberInBase(
    accountStore.balancesMap[usdtToken.denom]
  ).gt(0)

  return (
    accountStore.isDefaultSubaccount &&
    (hasNeptuneUsdtBalance || hasPeggyUsdtBalance)
  )
})

function onDeposit() {
  modalStore.openModal(Modal.Onboard)
}

function onOpenBankTransferModal() {
  modalStore.openModal(Modal.BankTransfer)
}
</script>

<template>
  <div>
    <h2 class="portfolio-title px px-4 pt-4">
      {{ $t('navigation.balances') }}
    </h2>

    <div class="lg:mt-8 p-4">
      <div class="lg:flex justify-between">
        <div>
          <p class="text-coolGray-400 text-sm">
            {{ $t('portfolio.balances.netWorth') }}
          </p>
          <div class="flex items-center space-x-4">
            <p class="text-2xl flex items-center space-x-1 h-12">
              <span>$</span>
              <CommonSkeletonSubaccountAmount
                :size="34"
                :spacing="8"
                :width="16"
              >
                <CommonNumberCounter
                  v-bind="{
                    value: aggregatedSubaccountTotalBalanceInUsd.toNumber()
                  }"
                  :size="24"
                />
              </CommonSkeletonSubaccountAmount>
            </p>

            <button
              class="text-coolGray-500 flex justify-center cursor-pointer"
              @click="appStore.toggleHideBalances"
            >
              <UIcon
                v-if="appStore.userState.preferences.isHideBalances"
                :name="NuxtUiIcons.EyeSlash"
                class="w-7 h-7 -translate-x-[2px]"
              />
              <UIcon v-else :name="NuxtUiIcons.Eye" class="w-7 h-7" />
            </button>
          </div>

          <p class="text-coolGray-400 text-sm flex items-center space-x-2 h-6">
            <span>≈</span>
            <CommonSkeletonSubaccountAmount>
              <CommonNumberCounter
                v-bind="{
                  size: 14,
                  decimals: DEFAULT_ASSET_DECIMALS,
                  value: accountTotalBalanceInInj.toNumber()
                }"
              />
            </CommonSkeletonSubaccountAmount>
            <span class="pb-[2px]">{{ injToken.symbol }}</span>
          </p>
        </div>

        <div
          class="flex space-y-2 max-md:flex-col md:items-center md:space-x-2 md:space-y-0 max-lg:mt-3"
        >
          <template
            v-if="
              ![Wallet.Magic, Wallet.Turnkey].includes(sharedWalletStore.wallet)
            "
          >
            <PartialsCommonBridgeRedirection
              v-bind="{
                isDeposit: true
              }"
            >
              <AppButton class="max-md:w-full">
                {{ $t('common.deposit') }}
              </AppButton>
            </PartialsCommonBridgeRedirection>

            <PartialsCommonBridgeRedirection>
              <AppButton variant="primary-outline" class="max-md:w-full">
                {{ $t('common.withdraw') }}
              </AppButton>
            </PartialsCommonBridgeRedirection>

            <PartialsCommonBridgeRedirection
              v-if="accountStore.isDefaultSubaccount"
              v-bind="{
                isTransfer: true
              }"
            >
              <AppButton class="max-md:w-full" variant="primary-outline">
                {{ $t('common.transfer') }}
              </AppButton>
            </PartialsCommonBridgeRedirection>
          </template>

          <template v-else>
            <AppButton class="max-md:w-full" @click="onDeposit">
              {{ $t('common.deposit') }}
            </AppButton>

            <AppButton
              v-if="accountStore.isDefaultSubaccount"
              class="max-md:w-full"
              variant="primary-outline"
              @click="onOpenBankTransferModal"
            >
              {{ $t('common.transfer') }}
            </AppButton>
          </template>
        </div>
      </div>

      <PartialsPortfolioBalancesNeptuneUsdt v-if="showNeptune" />

      <PartialsPortfolioBalancesSubaccount
        :class="[showNeptune ? 'lg:mt-7' : 'lg:mt-12']"
      />
    </div>

    <ModalsBankTransfer />
  </div>
</template>
