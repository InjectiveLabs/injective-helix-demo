<script lang="ts" setup>
import { Status, StatusType } from '@injectivelabs/utils'
import type { Token } from '@injectivelabs/token-metadata'
import { UiSpotMarketWithToken } from '@injectivelabs/sdk-ui-ts'
import { BusEvents, Modal, USDCSymbol } from '@/types'

const spotStore = useSpotStore()
const modalStore = useModalStore()
const tokenStore = useTokenStore()
const accountStore = useAccountStore()
const positionStore = usePositionStore()
const derivativeStore = useDerivativeStore()
const { $onError } = useNuxtApp()
const { fetchTokenUsdPrice } = useToken()

const hideBalances = ref(false)
const status = reactive(new Status(StatusType.Loading))
const usdPriceStatus = reactive(new Status(StatusType.Loading))

const usdcConvertMarket = ref<UiSpotMarketWithToken | undefined>(undefined)

const { accountBalancesWithToken: currentSubaccountBalances } = useBalance()

onMounted(() => {
  initBalances()

  useEventBus(BusEvents.FundingRefresh).on(refreshBalances)
  useEventBus<Token>(BusEvents.ConvertUsdc).on(setUsdcConvertMarket)
})

onBeforeUnmount(() => {
  modalStore.closeModal(Modal.AssetDetails)
  spotStore.reset()
})

function setUsdcConvertMarket(token: Token) {
  usdcConvertMarket.value = spotStore.usdcConversionModalMarkets.find(
    (market) =>
      market.baseToken.symbol === token.symbol &&
      market.quoteToken.symbol === USDCSymbol.WormholeEthereum
  )
}

function initBalances() {
  Promise.all([
    tokenStore.fetchBitcoinUsdPrice(),
    spotStore.fetchUsdcConversionMarkets(),
    derivativeStore.streamSubaccountOrders(),
    positionStore.fetchSubaccountPositions()
  ])
    .catch($onError)
    .finally(() => {
      status.setIdle()

      refreshUsdTokenPrice()
    })

  Promise.all([
    derivativeStore.streamSubaccountOrders(),
    derivativeStore.streamMarketsMarkPrices(),
    positionStore.streamSubaccountPositions()
  ])
}

function refreshBalances() {
  Promise.all([derivativeStore.fetchSubaccountOrders()])
}

function refreshUsdTokenPrice() {
  fetchTokenUsdPrice(currentSubaccountBalances.value.map((b) => b.token))
    .catch($onError)
    .finally(() => usdPriceStatus.setIdle())
}

function handleHideBalances(value: boolean) {
  hideBalances.value = value
}

watch(
  () => accountStore.subaccountId,
  () => positionStore.fetchSubaccountPositions()
)

useIntervalFn(refreshUsdTokenPrice, 1000 * 30)
</script>

<template>
  <div class="pt-6 sm:pb-8">
    <div>
      <h2 class="text-2xl text-white font-bold mb-4">
        {{ $t('account.accountOverview') }}
      </h2>

      <span class="text-gray-450 text-lg mb-1">
        {{ $t('account.netWorth') }}
      </span>

      <PartialsAccountOverview
        :is-loading="status.isLoading() || usdPriceStatus.isLoading()"
        v-bind="{ hideBalances, currentSubaccountBalances }"
        @update:hide-balances="handleHideBalances"
      />

      <div class="h-full-flex">
        <CommonTabMenu>
          <CommonTabMenuLinkItem v-bind="{ to: { name: 'account' } }" is-index>
            {{ $t('account.tabs.balances') }}
          </CommonTabMenuLinkItem>

          <CommonTabMenuLinkItem v-bind="{ to: { name: 'account-positions' } }">
            {{ $t('account.tabs.positions') }}
          </CommonTabMenuLinkItem>
        </CommonTabMenu>

        <AppHocLoading :status="status">
          <NuxtPage
            v-bind="{
              balances: currentSubaccountBalances,
              hideBalances,
              usdPriceStatus
            }"
          />
        </AppHocLoading>
      </div>
    </div>

    <PartialsAccountBalancesAssetDetails
      v-if="modalStore.modals[Modal.AssetDetails]"
    />

    <ModalsAddMargin />
    <ModalsCreateSubaccount />
    <ModalsSubaccountTransfer />
    <ModalsConvertUsdc
      v-if="usdcConvertMarket"
      :balances="currentSubaccountBalances"
      :market="usdcConvertMarket"
    />
  </div>
</template>
