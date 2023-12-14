<script lang="ts" setup>
import {
  Status,
  StatusType,
  BigNumberInWei,
  BigNumberInBase
} from '@injectivelabs/utils'
import { UiSpotMarketWithToken, MarketType } from '@injectivelabs/sdk-ui-ts'
import {
  BankBalanceIntegrityStrategy,
  SubaccountBalanceIntegrityStrategy
} from '@/app/client/streams/data-integrity/strategies'
import {
  MainPage,
  BridgeType,
  UiMarketWithToken,
  WalletConnectStatus
} from '@/types'

const appStore = useAppStore()
const walletStore = useWalletStore()
const accountStore = useAccountStore()
const { $onError } = useNuxtApp()

const props = defineProps({
  market: {
    type: Object as PropType<UiMarketWithToken>,
    required: true
  }
})

const isSpot = props.market.type === MarketType.Spot
const status = reactive(new Status(StatusType.Loading))

const { accountBalancesWithToken } = useBalance()

const baseTradingBalance = computed(() => {
  if (!isSpot) {
    return undefined
  }

  return accountBalancesWithToken.value.find(
    (balance) =>
      balance.denom === (props.market as UiSpotMarketWithToken).baseDenom
  )
})

const quoteTradingBalance = computed(() => {
  return accountBalancesWithToken.value.find(
    (balance) => balance.denom === props.market.quoteDenom
  )
})

const hasTradingAccountBalances = computed(() => {
  const minOrderPrice = new BigNumberInBase(1).shiftedBy(
    -props.market.priceDecimals
  )

  const baseTradingBalanceInBase = new BigNumberInWei(
    baseTradingBalance.value?.availableMargin || 0
  ).toBase(props.market.baseToken.decimals)

  const quoteTradingBalanceInBase = new BigNumberInWei(
    quoteTradingBalance.value?.availableMargin || 0
  ).toBase(props.market.quoteToken.decimals)

  if (props.market.type === MarketType.Derivative) {
    return quoteTradingBalanceInBase.gt(minOrderPrice)
  }

  return (
    quoteTradingBalanceInBase.gt(minOrderPrice) ||
    baseTradingBalanceInBase.gt(minOrderPrice)
  )
})

const baseTradingBalanceToFormat = computed(() =>
  new BigNumberInWei(baseTradingBalance.value?.availableMargin || '0')
    .toBase(props.market.baseToken.decimals)
    .toFormat(props.market.quantityDecimals, BigNumberInBase.ROUND_DOWN)
)

const quoteTradingBalanceToFormat = computed(() =>
  new BigNumberInWei(quoteTradingBalance.value?.availableMargin || '0')
    .toBase(props.market.quoteToken.decimals)
    .toFormat(props.market.priceDecimals, BigNumberInBase.ROUND_DOWN)
)

onMounted(() => {
  Promise.all([accountStore.fetchAccountPortfolio()])
    .then(() => {
      setSubaccountStreams()
    })
    .catch($onError)
    .finally(() => {
      status.setIdle()
    })
})

onWalletConnected(() => {
  setSubaccountStreams()
})

function setSubaccountStreams() {
  status.setLoading()

  Promise.all([
    accountStore.streamBankBalance(),
    accountStore.streamSubaccountBalance()
  ])
    .catch($onError)
    .finally(() => {
      status.setIdle()
    })
}

watch(
  () => accountStore.subaccountId,
  () => {
    // We need to re-fetch the portfolio API in case something changed
    setSubaccountStreams()
  }
)

useIntervalFn(() => {
  Promise.all([
    BankBalanceIntegrityStrategy.make().validate(),
    SubaccountBalanceIntegrityStrategy.make().validate()
  ])
}, 30 * 1000)
</script>

<template>
  <AppPanel class="w-full">
    <div>
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <p class="text-xs text-gray-500 flex items-center">
            {{
              $t(
                `marketPage.${
                  appStore.isSubaccountManagementActive
                    ? 'assetsFrom'
                    : 'assets'
                }`
              )
            }}
          </p>
          <PartialsCommonSubaccountSelector
            v-if="appStore.isSubaccountManagementActive"
          />
        </div>
        <NuxtLink
          v-if="walletStore.isUserWalletConnected"
          :to="{ name: MainPage.Account }"
          class="text-blue-500 text-2xs font-semibold"
        >
          {{ $t('marketPage.account') }}
        </NuxtLink>
      </div>
      <div v-if="walletStore.isUserWalletConnected" class="mt-4 relative">
        <AppHocLoading
          :is-loading="
            status.isLoading() ||
            walletStore.walletConnectStatus === WalletConnectStatus.connecting
          "
        >
          <div>
            <div
              v-if="
                !hasTradingAccountBalances && accountStore.isDefaultSubaccount
              "
            >
              <p class="text-xs text-gray-500">
                {{ $t('marketPage.noTradingBalance') }}
              </p>

              <BaseNuxtLink
                :to="{
                  name: MainPage.Bridge,
                  query: {
                    type: BridgeType.Deposit,
                    denom: isSpot
                      ? props.market.baseToken.denom
                      : props.market.quoteToken.denom
                  }
                }"
              >
                <AppButton
                  class="w-full rounded bg-blue-500 text-blue-900 mt-4"
                >
                  <span>
                    {{ $t('common.deposit') }}
                  </span>
                </AppButton>
              </BaseNuxtLink>
            </div>

            <div v-else>
              <div
                v-if="isSpot"
                class="flex justify-between items-center text-xs mb-4"
              >
                <span class="text-gray-500">
                  {{
                    $t('trade.available_asset', {
                      asset: market.baseToken.symbol
                    })
                  }}
                </span>
                <span class="font-mono text-white">
                  {{ baseTradingBalanceToFormat }}
                </span>
              </div>

              <div class="flex justify-between items-center text-xs">
                <span class="text-gray-500">
                  {{
                    $t('trade.available_asset', {
                      asset: market.quoteToken.symbol
                    })
                  }}
                </span>
                <div class="flex gap-2">
                  <span class="font-mono text-white">
                    {{ quoteTradingBalanceToFormat }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </AppHocLoading>
      </div>
      <CommonUserNotConnectedNote v-else cta />
    </div>
  </AppPanel>
</template>
