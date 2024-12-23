<script setup lang="ts">
import { NuxtUiIcons } from '@shared/types'
import { Wallet } from '@injectivelabs/wallet-ts'
import { ZERO_IN_BASE } from '@shared/utils/constant'
import { BTC_COIN_GECKO_ID } from '@/app/utils/constants'
import { Modal } from '@/types'

const appStore = useAppStore()
const modalStore = useSharedModalStore()
const tokenStore = useTokenStore()
const accountStore = useAccountStore()
const sharedWalletStore = useSharedWalletStore()
const { aggregatedSubaccountTotalBalanceInUsd } = useBalance()

const accountTotalBalanceInBtc = computed(() => {
  const btcUsdPrice = tokenStore.tokenUsdPriceByCoinGeckoId(BTC_COIN_GECKO_ID)

  if (!btcUsdPrice) {
    return ZERO_IN_BASE
  }

  return aggregatedSubaccountTotalBalanceInUsd.value.dividedBy(btcUsdPrice)
})

function onOpenBankTransferModal() {
  modalStore.openModal(Modal.BankTransfer)
}

function onFiatOnRamp() {
  modalStore.openModal(Modal.FiatOnboard)
}
</script>

<template>
  <div>
    <h2 class="portfolio-title px px-4 pt-4">
      {{ $t('navigation.balances') }}
    </h2>

    <div class="lg:mt-8">
      <div class="lg:flex justify-between p-4">
        <div>
          <p class="text-coolGray-400 text-sm">
            {{ $t('portfolio.balances.netWorth') }}
          </p>
          <div class="flex items-center space-x-4">
            <p class="text-2xl font-semibold flex items-center space-x-2 h-12">
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
                :decimals="4"
                v-bind="{
                  value: accountTotalBalanceInBtc.toNumber(),
                  size: 14
                }"
              />
            </CommonSkeletonSubaccountAmount>
            <span class="pb-[2px]">{{ $t('common.BTC') }}</span>
          </p>
        </div>

        <div
          class="flex space-y-2 max-md:flex-col md:items-center md:space-x-2 md:space-y-0"
        >
          <template v-if="sharedWalletStore.wallet !== Wallet.Magic">
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
            <AppButton class="max-md:w-full" @click="onFiatOnRamp">
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

      <PartialsPortfolioBalancesSubaccount class="lg:mt-12" />
    </div>

    <ModalsBankTransfer />
  </div>
</template>
