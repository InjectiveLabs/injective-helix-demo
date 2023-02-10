<script lang="ts" setup>
import { PropType } from 'vue'
import { Status, StatusType } from '@injectivelabs/utils'
import { Token } from '@injectivelabs/token-metadata'
import { UiSpotMarketWithToken } from '@injectivelabs/sdk-ui-ts'
import { AccountBalance, BusEvents, Modal, USDCSymbol } from '@/types'

const route = useRoute()
const modalStore = useModalStore()
const tokenStore = useTokenStore()
const accountStore = useAccountStore()
const bankStore = useBankStore()
const derivativeStore = useDerivativeStore()
const positionStore = usePositionStore()
const spotStore = useSpotStore()
const { $onError } = useNuxtApp()
const { fetchTokenUsdPrice } = useBalance()

defineProps({
  balances: {
    type: Array as PropType<AccountBalance[]>,
    required: true
  }
})

const FilterList = {
  Balances: 'balances',
  Positions: 'positions'
}

const hideBalances = ref(false)
const activeType = ref(FilterList.Balances)
const status = reactive(new Status(StatusType.Loading))
const usdPriceStatus = reactive(new Status(StatusType.Loading))

const usdcConvertMarket = ref<UiSpotMarketWithToken | undefined>(undefined)

onMounted(() => {
  handleViewFromRoute()
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
  handleViewFromRoute()

  Promise.all([
    tokenStore.fetchBitcoinUsdPrice(),
    bankStore.fetchBankBalancesWithToken(),
    accountStore.streamSubaccountBalances(),
    derivativeStore.streamSubaccountOrders(),
    positionStore.fetchSubaccountPositions(),
    positionStore.streamSubaccountPositions(),
    spotStore.fetchUsdcConversionMarkets(),
    tokenStore.fetchErc20BalancesWithTokenAndPrice()
  ])
    .catch($onError)
    .finally(() => {
      status.setIdle()

      refreshUsdTokenPrice()
    })
}

function handleViewFromRoute() {
  const filterListValues = Object.values(FilterList)
  const tab = filterListValues.find((tab) => tab === route.query.view)

  if (tab) {
    activeType.value = tab
  }
}

function refreshBalances() {
  Promise.all([
    bankStore.fetchBankBalancesWithToken(),
    derivativeStore.fetchSubaccountOrders(),
    positionStore.fetchSubaccountPositions() // refresh mark price
  ])
}

function refreshUsdTokenPrice() {
  fetchTokenUsdPrice()
    .catch($onError)
    .finally(() => usdPriceStatus.setIdle())
}

function handleHideBalances(value: boolean) {
  hideBalances.value = value
}

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
        :balances="balances"
        :is-loading="status.isLoading() || usdPriceStatus.isLoading()"
        :hide-balances="hideBalances"
        @update:hide-balances="handleHideBalances"
      />

      <div class="h-full-flex">
        <CommonTabMenu>
          <AppSelectButton
            v-for="filterType in Object.values(FilterList)"
            :key="`account-tabs-${filterType}`"
            v-model="activeType"
            :value="filterType"
          >
            <template #default="{ active }">
              <NuxtLink
                :to="{
                  name: 'account',
                  query: { view: filterType }
                }"
              >
                <CommonTabMenuItem :active="active">
                  <p v-if="filterType === FilterList.Balances">
                    {{ $t('account.tabs.balances') }}
                  </p>

                  <p v-if="filterType === FilterList.Positions">
                    {{ $t('account.tabs.positions') }}
                  </p>
                </CommonTabMenuItem>
              </NuxtLink>
            </template>
          </AppSelectButton>
        </CommonTabMenu>

        <AppHocLoading :status="status">
          <PartialsAccountBalances
            v-if="activeType === FilterList.Balances"
            v-bind="{
              balances,
              hideBalances,
              usdPriceStatus
            }"
          />

          <PartialsAccountPositions
            v-if="activeType === FilterList.Positions"
            v-bind="{ hideBalances, balances }"
          />
        </AppHocLoading>
      </div>
    </div>

    <PartialsAccountBalancesAssetDetails
      v-if="modalStore.modals[Modal.AssetDetails]"
    />
    <PartialsAccountBridge />

    <ModalsAddMargin />
    <ModalsConvertUsdc
      v-if="usdcConvertMarket"
      :balances="balances"
      :market="usdcConvertMarket"
    />
  </div>
</template>
