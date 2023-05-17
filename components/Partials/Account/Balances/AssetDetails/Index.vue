<script lang="ts" setup>
import { Status, StatusType, BigNumberInBase } from '@injectivelabs/utils'
import { UiSpotMarketWithToken } from '@injectivelabs/sdk-ui-ts'
import { AccountBalance, BridgeType, BusEvents, Modal } from '@/types'
import {
  UI_DEFAULT_DISPLAY_DECIMALS,
  UI_DEFAULT_MIN_DISPLAY_DECIMALS
} from '@/app/utils/constants'

const modalStore = useModalStore()
const spotStore = useSpotStore()

const status = reactive(new Status(StatusType.Idle))
const scrollOffset = ref(0)
const accountBalance = ref<AccountBalance | undefined>(undefined)

const isModalOpen = computed(
  () => modalStore.modals[Modal.AssetDetails] && !!accountBalance.value
)

const filteredMarketsWithSummary = computed(() => {
  return spotStore.marketsWithSummary.filter(({ market }) => {
    if (!accountBalance.value) {
      return false
    }

    return (
      (market as UiSpotMarketWithToken).baseDenom ===
        accountBalance.value.token.denom ||
      market.quoteDenom === accountBalance.value.token.denom
    )
  })
})

const availableMargin = computed(() => {
  return new BigNumberInBase(accountBalance.value?.availableMargin || 0)
})

const { valueToString: availableMarginToString } = useBigNumberFormatter(
  availableMargin,
  {
    decimalPlaces: UI_DEFAULT_DISPLAY_DECIMALS
  }
)

const { valueToString: inOrderBalanceToString } = useBigNumberFormatter(
  computed(() => accountBalance.value?.inOrderBalance || '0'),
  {
    decimalPlaces: UI_DEFAULT_DISPLAY_DECIMALS
  }
)

const { valueToString: accountTotalBalanceToString } = useBigNumberFormatter(
  computed(() => accountBalance.value?.accountTotalBalance || '0'),
  {
    decimalPlaces: UI_DEFAULT_DISPLAY_DECIMALS
  }
)

const { valueToString: accountTotalBalanceInUsdToString } =
  useBigNumberFormatter(
    computed(() => accountBalance.value?.accountTotalBalanceInUsd || '0'),
    {
      decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS
    }
  )

onMounted(() => {
  useEventBus<AccountBalance>(BusEvents.AssetDetailsModalPayload).on(
    (accountBalancePayload) => {
      accountBalance.value = accountBalancePayload
    }
  )
})

watch(
  () => isModalOpen.value,
  (value: boolean) => {
    if (value) {
      return handleOpen()
    }

    handleClosed()
  }
)

function handleOpen() {
  scrollOffset.value = window.pageYOffset
  window.scrollTo(0, 0)
}

function handleClosed() {
  window.scrollTo(0, scrollOffset.value)
}

function handleClose() {
  modalStore.closeModal(Modal.AssetDetails)
  accountBalance.value = undefined
}
</script>

<template>
  <div
    v-if="isModalOpen && accountBalance"
    class="fixed inset-0 lg:top-14 bg-gray-900 w-full z-40"
  >
    <AppHocLoading :status="status" class="h-full">
      <div
        class="container py-6 h-full min-h-screen-excluding-header flex flex-col"
      >
        <div
          class="w-full mx-auto 3xl:w-11/12 4xl:w-10/12 flex flex-col h-full flex-grow"
        >
          <div class="flex items-center justify-start gap-2">
            <div class="cursor-pointer" @click="handleClose">
              <!-- TODO: ArrowLeft -->
              <BaseIcon name="arrow" class="w-4 h-4 text-white" />
            </div>

            <span class="font-bold text-sm">
              {{ $t('account.assetDetails.title') }}
            </span>
          </div>

          <div class="mt-6 border-b border-gray-600">
            <div
              v-if="accountBalance"
              class="flex items-center justify-start gap-2"
            >
              <CommonTokenIcon
                v-if="accountBalance && accountBalance.token"
                :token="accountBalance.token"
                sm
              />
              <span class="tracking-wide font-bold text-sm">
                {{ accountBalance.token.symbol }}
              </span>
              <span class="text-gray-450 text-xs">
                {{ accountBalance.token.name }}
              </span>
            </div>

            <div class="flex flex-col gap-4 py-4">
              <div class="flex justify-between items-center">
                <span class="text-gray-350 text-sm">
                  {{ $t('account.balances.cols.availableBalance') }}
                </span>

                <span class="font-mono text-sm tracking-wide">
                  {{ availableMarginToString }}
                </span>
              </div>

              <div class="flex justify-between items-center">
                <span class="text-gray-350 text-sm">
                  {{ $t('account.balances.cols.inUseReserved') }}
                </span>

                <span class="font-mono text-sm tracking-wide">
                  {{ inOrderBalanceToString }}
                </span>
              </div>

              <div class="flex justify-between items-center">
                <span class="text-gray-350 text-sm">
                  {{ $t('account.balances.cols.totalBalance') }}
                </span>

                <span class="font-mono text-sm tracking-wide">
                  {{ accountTotalBalanceToString }}
                </span>
              </div>

              <div class="flex justify-between items-center">
                <span class="text-gray-350 text-sm">
                  {{ $t('account.balances.cols.value', { symbol: 'USD' }) }}
                </span>
                <span class="font-mono text-sm tracking-wide">
                  {{ accountTotalBalanceInUsdToString }} USD
                </span>
              </div>
            </div>
          </div>

          <div class="py-6 h-full overflow-hidden flex flex-col gap-4">
            <span class="font-bold text-sm">
              {{ $t('account.assetDetails.trade') }}
            </span>

            <div
              v-if="filteredMarketsWithSummary.length > 0"
              class="h-full overflow-marketsWithSummary-auto"
            >
              <div class="grid grid-cols-2 gap-4">
                <NuxtLink
                  v-for="{ market, summary } in filteredMarketsWithSummary"
                  :key="market.slug"
                  :to="{
                    name: 'spot-spot',
                    params: { spot: market.slug }
                  }"
                >
                  <PartialsAccountBalancesAssetDetailsMarketCard
                    :market="market"
                    :summary="summary"
                  />
                </NuxtLink>
              </div>
            </div>

            <div v-else class="mt-4">
              <span class="text-sm">
                {{ $t('account.assetDetails.emptyMarkets') }}
              </span>
            </div>
          </div>

          <div class="mt-auto flex justify-between gap-4">
            <NuxtLink
              class="w-full"
              :to="{
                name: 'bridge',
                query: {
                  type: BridgeType.Deposit,
                  denom: accountBalance.token.denom
                }
              }"
            >
              <button
                class="w-full cursor-pointer h-10 flex justify-center items-center rounded-lg bg-blue-500 border-transparent border"
              >
                <span class="text-sm font-medium">
                  {{ $t('account.deposit') }}
                </span>
              </button>
            </NuxtLink>

            <NuxtLink
              class="w-full"
              :to="{
                name: 'bridge',
                query: {
                  type: BridgeType.Withdraw,
                  denom: accountBalance.token.denom
                }
              }"
            >
              <button
                class="w-full cursor-pointer h-10 flex justify-center items-center rounded-lg bg-transparent border-blue-500 border"
              >
                <span class="text-sm font-medium text-blue-500">
                  {{ $t('account.withdraw') }}
                </span>
              </button>
            </NuxtLink>
          </div>
        </div>
      </div>
    </AppHocLoading>
  </div>
</template>
