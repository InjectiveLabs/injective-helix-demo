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

const status = reactive(new Status(StatusType.Loading))
const activeType = ref(FilterList.Balances)
const hideBalances = ref(false)

const usdcConvertMarket = ref<UiSpotMarketWithToken | undefined>(undefined)

onMounted(() => {
  handleViewFromRoute()
  initBalances()

  useEventBus(BusEvents.FundingRefresh).on(refreshBalances)
  useEventBus<Token>(BusEvents.ConvertUSDC).on(setMarketFromToken)
})

onBeforeUnmount(() => {
  modalStore.closeModal(Modal.AssetDetails)
  spotStore.reset()
})

function setMarketFromToken(token: Token) {
  usdcConvertMarket.value = [
    ...spotStore.markets,
    ...spotStore.hiddenMarkets
  ].find(
    (market) =>
      market.baseToken.symbol === token.symbol &&
      market.quoteToken.symbol === USDCSymbol.WormholeEthereum
  )
}

function initBalances() {
  handleViewFromRoute()

  Promise.all([
    accountStore.streamSubaccountBalances(),
    derivativeStore.streamSubaccountOrders(),
    positionStore.fetchSubaccountPositions(),
    positionStore.streamSubaccountPositions(),
    tokenStore.getErc20TokensWithBalanceAndPriceFromBankAndMarkets()
  ])
    .catch($onError)
    .finally(() => {
      status.setIdle()
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
  ]).catch(() => {
    // silently fail
  })
}

function handleHideBalances(value: boolean) {
  hideBalances.value = value
}
</script>

<template>
  <div class="h-full-flex w-full flex-wrap">
    <AppHocLoading :status="status">
      <div class="container pt-6 pb-12">
        <div class="w-full mx-auto 3xl:w-11/12 4xl:w-10/12 flex flex-col">
          <h2 class="text-2xl text-white font-bold mb-4">
            {{ $t('account.accountOverview') }}
          </h2>

          <span class="text-gray-450 text-lg mb-1">
            {{ $t('account.netWorth') }}
          </span>

          <PartialsAccountOverview
            :balances="balances"
            :hide-balances="hideBalances"
            @update:hide-balances="handleHideBalances"
          />

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

          <PartialsAccountBalances
            v-if="activeType === FilterList.Balances"
            v-bind="{
              hideBalances,
              balances
            }"
          />

          <PartialsAccountPositions
            v-if="activeType === FilterList.Positions"
            v-bind="{ hideBalances, balances }"
          />
        </div>
      </div>
    </AppHocLoading>

    <PartialsAccountBalancesAssetDetails
      v-if="modalStore.modals[Modal.AssetDetails]"
    />
    <PartialsAccountBridge />

    <ModalsAddMargin />

    <ModalsConvertUSDCWrapper
      v-if="usdcConvertMarket"
      :balances="balances"
      :market="usdcConvertMarket"
    />
  </div>
</template>
