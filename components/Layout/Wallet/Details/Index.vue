<script lang="ts" setup>
import { BigNumber } from '@injectivelabs/utils'
import { Wallet } from '@injectivelabs/wallet-base'
import { NuxtUiIcons, WalletConnectStatus } from '@shared/types'
import { sharedEllipsisFormatText } from '@shared/utils/formatter'
import { DEFAULT_TRUNCATE_LENGTH } from '@/app/utils/constants'
import * as WalletTracker from '@/app/providers/mixpanel/WalletTracker'
import { Modal, MainPage, PortfolioSubPage } from '@/types'

const route = useRoute()
const router = useRouter()
const walletStore = useWalletStore()
const modalStore = useSharedModalStore()
const sharedWalletStore = useSharedWalletStore()
const { lg } = useSharedBreakpoints()
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

function onDeposit() {
  modalStore.openModal(Modal.Onboard)
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
    <UPopover
      :key="lg ? 'lg' : 'mobile'"
      :mode="lg ? 'hover' : 'click'"
      :ui="{ base: 'overflow-visible' }"
    >
      <template #default>
        <div
          class="font-medium text-xs cursor-pointer flex items-center justify-center lg:justify-start w-8 h-8 lg:w-auto lg:px-6 rounded-lg"
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
              class="lg:w-4 lg:h-4 w-5 h-5 rounded-md text-white"
            />
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
            <div class="flex flex-col py-5 px-4 border-b">
              <div class="flex justify-between pb-5">
                <p class="text-sm font-semibold text-coolGray-200">
                  {{ $t('navigation.myAccount') }}
                </p>

                <div class="flex items-center gap-x-4">
                  <NuxtLink
                    :to="{ name: PortfolioSubPage.Settings }"
                    class="leading-4"
                  >
                    <UIcon
                      :name="NuxtUiIcons.SettingsOutline"
                      class="h-4 w-4 min-w-4 mt-0.5 text-white hover:text-blue-500"
                    />
                  </NuxtLink>

                  <UIcon
                    :name="NuxtUiIcons.ExitOutline"
                    class="h-5 w-5 min-w-5 text-white hover:text-blue-500"
                    @click="disconnect"
                  />
                </div>
              </div>
              <LayoutWalletDetailsConnectedWallet
                :wallet="sharedWalletStore.wallet"
              />
            </div>

            <div class="text-white p-4">
              <p class="text-2xs text-coolGray-450 font-medium">
                {{ $t('portfolio.totalValue') }}
              </p>

              <p class="text-2xl font-semibold my-1 leading-6">
                <SharedAmountUsd
                  v-bind="{
                    roundingMode: BigNumber.ROUND_HALF_UP,
                    amount: aggregatedSubaccountTotalBalanceInUsd.toFixed()
                  }"
                >
                  <template #prefix>$</template>
                </SharedAmountUsd>
              </p>

              <div class="flex items-center space-x-1 text-2xs">
                <div>{{ $t('portfolio.staked') }}:</div>
                <div>
                  <SharedAmountUsd
                    class="leading-5"
                    v-bind="{
                      amount: stakedAmountInUsd.toFixed(),
                      roundingMode: BigNumber.ROUND_HALF_UP
                    }"
                  >
                    <template #prefix>$</template>
                  </SharedAmountUsd>
                </div>
              </div>

              <div class="mt-5">
                <AppButton class="w-full" size="md" @click="onDeposit">
                  {{ $t('common.deposit') }}
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

    <LayoutWalletDetailsAutosign />

    <ModalsQRCode />
  </div>
</template>
