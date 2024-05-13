<script lang="ts" setup>
import { formatWalletAddress } from '@injectivelabs/utils'
import { ROUTES } from '@/app/utils/constants'
import { MainPage } from '@/types'

const route = useRoute()
const router = useRouter()
const walletStore = useWalletStore()

const formattedInjectiveAddress = computed(() =>
  formatWalletAddress(walletStore.injectiveAddress)
)

function disconnect() {
  walletStore.disconnect()

  if (
    ROUTES.walletConnectedRequiredRouteNames.includes(route.name as MainPage)
  ) {
    router.push({ name: MainPage.Index })
  }
}
</script>

<template>
  <div class="flex items-center min-h-[40.2px]">
    <BaseHoverMenu
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
                <span class="text-sm font-semibold text-gray-200">
                  {{ $t('navigation.myAccount') }}
                </span>
                <span
                  class="text-blue-500 hover:text-opacity-80 cursor-pointer text-xs font-medium"
                  @click="disconnect"
                >
                  {{ $t('navigation.disconnect') }}
                </span>
              </div>
              <LayoutWalletDetailsConnectedWallet
                :wallet="walletStore.wallet"
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
                <AppButton class="w-full" size="sm">Deposit</AppButton>
              </div>

              <div>
                <LayoutWalletDetailsBalances />
              </div>
            </div>
          </div>
        </div>
      </template>
    </BaseHoverMenu>

    <ModalsQRCode />
  </div>
</template>
