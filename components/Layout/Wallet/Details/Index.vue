<script lang="ts" setup>
import { formatWalletAddress } from '@injectivelabs/utils'
import * as WalletTracker from '@/app/providers/mixpanel/WalletTracker'
import { MainPage, PortfolioSubPage } from '@/types'
import { getBridgeRedirectionUrl } from '@/app/utils/network'

const route = useRoute()
const router = useRouter()
const sharedWalletStore = useSharedWalletStore()
const walletStore = useWalletStore()

const formattedInjectiveAddress = computed(() =>
  formatWalletAddress(sharedWalletStore.injectiveAddress)
)

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
  <div class="flex items-center min-h-[40px]">
    <SharedHoverMenu
      popper-class="min-w-[310px] sm:min-w-[356px]  shadow-dropdown rounded-md"
    >
      <template #default="{ toggle }">
        <div
          class="font-medium text-sm cursor-pointer flex items-center justify-center lg:justify-start w-8 h-8 lg:w-auto lg:px-6 rounded-lg"
          @click="toggle"
        >
          <SharedIcon
            name="user"
            class="lg:mr-2 w-8 h-8 p-1 rounded-md hover:bg-brand-800"
          />
          <span class="hidden lg:block font-mono">
            {{ formattedInjectiveAddress }}
          </span>
        </div>
      </template>

      <template #content>
        <div
          class="flex flex-col gap-4 rounded-lg bg-brand-900 backdrop-blur-sm border border-brand-800"
        >
          <div class="rounded-lg">
            <div class="flex flex-col py-3 px-4 border-b">
              <div class="flex justify-between pb-2">
                <div class="flex items-center gap-2">
                  <span class="text-sm font-semibold text-gray-200">
                    {{ $t('navigation.myAccount') }}
                  </span>

                  <NuxtLink :to="{ name: PortfolioSubPage.Settings }">
                    <SharedIcon
                      is-md
                      name="gear"
                      class="text-white hover:text-blue-500"
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
              <p class="text-xs text-gray-400">
                {{ $t('portfolio.totalValue') }}
              </p>

              <CommonHeadlessTotalBalance>
                <template #default="{ accountTotalBalanceInUsdToString }">
                  <p class="text-2xl font-semibold my-2">
                    ${{ accountTotalBalanceInUsdToString }}
                  </p>
                </template>
              </CommonHeadlessTotalBalance>

              <div class="mt-6">
                <NuxtLink
                  target="_blank"
                  :external="true"
                  :to="getBridgeRedirectionUrl()"
                >
                  <AppButton class="w-full" size="sm">
                    {{ $t('connect.deposit') }}
                  </AppButton>
                </NuxtLink>
              </div>

              <div>
                <LayoutWalletDetailsBalances />
              </div>
            </div>
          </div>
        </div>
      </template>
    </SharedHoverMenu>

    <ModalsQRCode />
  </div>
</template>
