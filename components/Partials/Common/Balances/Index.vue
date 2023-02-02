<script lang="ts" setup>
import { PropType } from 'vue'
import { UiSpotMarketWithToken, MarketType } from '@injectivelabs/sdk-ui-ts'
import {
  BigNumberInBase,
  BigNumberInWei,
  Status,
  StatusType
} from '@injectivelabs/utils'
import { UiMarketWithToken, WalletConnectStatus } from '@/types'

const accountStore = useAccountStore()
const bankStore = useBankStore()
const onboardStore = useOnboardStore()
const walletStore = useWalletStore()
const { $onError } = useNuxtApp()

const props = defineProps({
  market: {
    type: Object as PropType<UiMarketWithToken>,
    required: true
  }
})

const isSpot = props.market.type === MarketType.Spot
const status = reactive(new Status(StatusType.Loading))

const baseTradingBalance = computed(() => {
  if (!accountStore.subaccount || !isSpot) {
    return undefined
  }

  const baseBalance = accountStore.subaccount.balances.find(
    (balance) =>
      balance.denom.toLowerCase() ===
      (props.market as UiSpotMarketWithToken).baseDenom.toLowerCase()
  )

  return {
    totalBalance: baseBalance ? baseBalance.totalBalance : '0',
    availableBalance: baseBalance ? baseBalance.availableBalance : '0'
  }
})

const quoteTradingBalance = computed(() => {
  if (!accountStore.subaccount) {
    return undefined
  }

  const quoteBalance = accountStore.subaccount.balances.find(
    (balance) =>
      balance.denom.toLowerCase() === props.market.quoteDenom.toLowerCase()
  )

  return {
    totalBalance: quoteBalance ? quoteBalance.totalBalance : '0',
    availableBalance: quoteBalance ? quoteBalance.availableBalance : '0'
  }
})

const hasTradingAccountBalances = computed(() => {
  const minOrderPrice = new BigNumberInBase(1).shiftedBy(
    -props.market.priceDecimals
  )

  const baseTradingBalanceInBase = new BigNumberInWei(
    baseTradingBalance.value?.availableBalance || 0
  ).toBase(props.market.baseToken.decimals)

  const quoteTradingBalanceInBase = new BigNumberInWei(
    quoteTradingBalance.value?.availableBalance || 0
  ).toBase(props.market.quoteToken.decimals)

  if (props.market.type === MarketType.Derivative) {
    return quoteTradingBalanceInBase.gt(minOrderPrice)
  }

  return (
    quoteTradingBalanceInBase.gt(minOrderPrice) ||
    baseTradingBalanceInBase.gt(minOrderPrice)
  )
})

watch(
  () => walletStore.walletConnectStatus,
  (walletConnectStatus) => {
    if (walletConnectStatus === WalletConnectStatus.connecting) {
      status.setLoading()
    }
  }
)

onWalletConnected(() => {
  status.setLoading()

  Promise.all([onboardStore.init(), bankStore.fetchBankBalancesWithToken()])
    .catch($onError)
    .finally(() => {
      status.setIdle()
    })
})
</script>

<template>
  <AppPanel class="w-full">
    <div>
      <div class="flex items-center justify-between">
        <p class="text-xs text-gray-500 flex items-center">
          {{ $t('marketPage.assets') }}
        </p>
        <NuxtLink
          v-if="walletStore.isUserWalletConnected"
          :to="{ name: 'account' }"
          class="text-blue-500 text-2xs font-semibold"
        >
          {{ $t('marketPage.account') }}
        </NuxtLink>
      </div>
      <div v-if="walletStore.isUserWalletConnected" class="mt-4 relative">
        <AppHocLoading :status="status">
          <div
            v-if="
              walletStore.walletConnectStatus !== WalletConnectStatus.connecting
            "
          >
            <div
              v-if="!bankStore.hasAnyBankBalance && !hasTradingAccountBalances"
            >
              <p class="text-xs text-gray-500">
                {{ $t('marketPage.noChainBalance') }}
              </p>
            </div>
            <PartialsCommonBalancesSubaccount
              v-else
              v-bind="{
                baseTradingBalance,
                market,
                quoteTradingBalance
              }"
              data-cy="trading-page-account-balances-component"
            />
            <PartialsCommonBalancesOnboard
              v-if="!hasTradingAccountBalances"
              class="mt-6"
              :market="market"
            />
          </div>
        </AppHocLoading>
      </div>
      <CommonUserNotConnectedNote v-else />
    </div>
  </AppPanel>
</template>
