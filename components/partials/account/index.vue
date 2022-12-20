<template>
  <div class="h-full w-full flex flex-wrap">
    <div class="w-full">
      <HocLoading :status="status">
        <div class="container pt-6 pb-12">
          <div class="w-full mx-auto 3xl:w-11/12 4xl:w-10/12 flex flex-col">
            <h2 class="text-2xl text-white font-bold mb-4">
              {{ $t('account.accountOverview') }}
            </h2>

            <span class="text-gray-450 text-lg mb-1">
              {{ $t('account.netWorth') }}
            </span>

            <AccountOverview
              :balances="balances"
              :hide-balances="hideBalances"
              @update:hide-balances="handleHideBalances"
            />

            <AccountTabs :tabs="tabs" :value="activeView" />

            <component
              :is="`${activeView.value}`"
              v-bind="{
                hideBalances,
                balances
              }"
            />
          </div>
        </div>
      </HocLoading>
    </div>

    <ModalAddMargin />
    <Bridge />

    <portal to="modals">
      <AssetDetails />
    </portal>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { Status, StatusType } from '@injectivelabs/utils'
import {
  UiDerivativeMarketWithToken,
  UiPosition
} from '@injectivelabs/sdk-ui-ts'
import AccountOverview from '~/components/partials/account/account-overview.vue'
import AccountTabs from '~/components/partials/account/account-tabs.vue'
import Balances from '~/components/partials/account/balances/index.vue'
import Positions from '~/components/partials/account/positions/index.vue'
import ModalAddMargin from '~/components/partials/modals/add-margin/index.vue'
import Bridge from '~/components/partials/portfolio/bridge.vue'
import AssetDetails from '~/components/partials/account/balances/asset-details.vue'
import { AccountBalance, Modal, TabOption } from '~/types'

const tabs = [
  {
    value: 'Balances',
    label: 'account.tabs.balances',
    url: 'balances'
  },
  {
    value: 'Positions',
    label: 'account.tabs.positions',
    url: 'positions'
  }
] as TabOption[]

export default Vue.extend({
  components: {
    AccountOverview,
    AccountTabs,
    Balances,
    Positions,
    ModalAddMargin,
    Bridge,
    AssetDetails
  },

  props: {
    balances: {
      type: Array as PropType<AccountBalance[]>,
      required: true
    }
  },

  data() {
    return {
      status: new Status(StatusType.Loading),
      tabs,
      activeView: tabs[0],
      hideBalances: false
    }
  },

  computed: {
    markets(): UiDerivativeMarketWithToken[] {
      return this.$accessor.derivatives.markets
    },

    positions(): UiPosition[] {
      return this.$accessor.positions.subaccountPositions
    }
  },

  watch: {
    '$route.query'() {
      this.init()
    }
  },

  mounted() {
    this.init()
  },

  beforeDestroy() {
    this.$accessor.modal.closeModal(Modal.AssetDetails)
  },

  methods: {
    init() {
      const { $route } = this
      const { view } = $route.query

      const tab = tabs.find((tab) => tab.url === view)
      if (tab) {
        this.activeView = tab
      }

      Promise.all([
        this.$accessor.token.getErc20TokensWithBalanceAndPriceFromBankAndMarkets(),
        this.$accessor.account.fetchSubaccountsBalancesWithPrices(),
        this.$accessor.positions.fetchSubaccountPositions()
      ])
        .then(() => {
          this.$accessor.positions.streamSubaccountPositions()
        })
        .catch(this.$onError)
        .finally(() => {
          this.status.setIdle()
        })
    },

    handleHideBalances(value: boolean) {
      this.hideBalances = value
    }
  }
})
</script>
