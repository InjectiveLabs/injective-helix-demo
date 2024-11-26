<script lang="ts" setup>
import { Wallet } from '@injectivelabs/wallet-base'
import { NuxtUiIcons, WalletConnectStatus } from '@shared/types'
import { sharedEllipsisFormatText } from '@shared/utils/formatter'
import * as WalletTracker from '@/app/providers/mixpanel/WalletTracker'
import {
  DEFAULT_TRUNCATE_LENGTH,
  UI_DEFAULT_MIN_DISPLAY_DECIMALS
} from '@/app/utils/constants'
import { Modal, MainPage, PortfolioSubPage } from '@/types'

const route = useRoute()
const router = useRouter()
const walletStore = useWalletStore()
const modalStore = useSharedModalStore()
const sharedWalletStore = useSharedWalletStore()
const { stakedAmountInUsd, aggregatedSubaccountTotalBalanceInUsd } =
  useBalance()

const formattedAddress = computed(() =>
  sharedEllipsisFormatText(
    sharedWalletStore.wallet === Wallet.Metamask
      ? sharedWalletStore.address
      : sharedWalletStore.injectiveAddress,
    DEFAULT_TRUNCATE_LENGTH
  )
)

function openDepositQRModal() {
  if (sharedWalletStore.wallet === Wallet.Magic) {
    modalStore.openModal(Modal.FiatOnboard)

    return
  }

  modalStore.openModal(Modal.DepositQr)
}

function disconnect() {
  walletStore.disconnect()
  WalletTracker.trackLogout()

  if (
    [MainPage.Portfolio, ...Object.values(PortfolioSubPage)].includes(
      route.name as MainPage
    )
  ) {
    router.push({ name: MainPage.Index })
  }
}
</script>

<template>
  <div class="flex items-center min-h-[22px]">
    <UPopover mode="hover" :ui="{ base: 'overflow-visible' }">
      <template #default>
        <div
          class="font-medium text-xs cursor-pointer flex items-center justify-center lg:justify-start w-8 h-8 lg:w-auto lg:px-4 rounded-lg"
        >
          <AppSpinner
            v-if="
              sharedWalletStore.walletConnectStatus ===
              WalletConnectStatus.disconnecting
            "
            is-sm
            is-white
          />
          <div v-else class="flex items-center justify-center space-x-2">
            <UIcon
              :name="NuxtUiIcons.UserOutline"
              class="w-4 h-4 rounded-md text-[#black]"
            />
            <div
              v-if="sharedWalletStore.isAutoSignEnabled"
              class="bg-white px-1 py-0.5 rounded flex items-center justify-center"
            >
              <UIcon
                :name="NuxtUiIcons.RotateAuto"
                class="w-4 h-4 rounded-md text-black"
              />
            </div>
          </div>

          <span class="hidden lg:block lg:ml-2">
            {{ formattedAddress }}
          </span>
        </div>
      </template>

      <template #panel>
        <div
          class="flex flex-col gap-4 min-w-[310px] sm:min-w-[356px] rounded-lg bg-brand-900 backdrop-blur-sm border border-brand-800"
        >
          <div class="rounded-lg">
            <div class="flex flex-col py-3 px-4 border-b">
              <div class="flex justify-between pb-2">
                <div class="flex items-center gap-2">
                  <span class="text-sm font-semibold text-coolGray-200">
                    {{ $t('navigation.myAccount') }}
                  </span>

                  <NuxtLink :to="{ name: PortfolioSubPage.Settings }">
                    <UIcon
                      :name="NuxtUiIcons.Settings"
                      class="h-4 w-4 min-w-4 text-white hover:text-blue-500"
                    />
                  </NuxtLink>
                </div>
                <span
                  class="text-blue-500 hover:text-opacity-80 cursor-pointer text-xs font-medium"
                  @click="disconnect"
                >
                  {{ $t('navigation.disconnect') }}
                </span>
              </div>
              <LayoutWalletDetailsConnectedWallet
                :wallet="sharedWalletStore.wallet"
              />
            </div>

            <div class="text-white p-4">
              <p class="text-xs text-coolGray-400">
                {{ $t('portfolio.totalValue') }}
              </p>

              <p class="text-2xl font-semibold mb-2 mt-0">
                <span>$</span>
                <AppUsdAmount
                  v-bind="{
                    amount: aggregatedSubaccountTotalBalanceInUsd.toFixed(),
                    decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS
                  }"
                />
              </p>

              <div class="flex items-center space-x-1 text-sm">
                <UIcon
                  :name="NuxtUiIcons.PottedPlant"
                  class="max-sm:h-4 max-sm:w-4 h-5 w-5 hidden sm:block"
                />
                <div>{{ $t('account.staked') }}:</div>
                <div>
                  <span>$</span>
                  <AppUsdAmount
                    class="leading-5"
                    v-bind="{
                      amount: stakedAmountInUsd.toFixed()
                    }"
                  />
                </div>
              </div>

              <div class="mt-6">
                <AppButton class="w-full" size="md" @click="openDepositQRModal">
                  {{ $t('connect.deposit') }}
                </AppButton>
              </div>

              <div>
                <LayoutWalletDetailsBalances />
              </div>
            </div>
          </div>
        </div>
      </template>
    </UPopover>

    <ModalsQRCode />
  </div>
</template>
