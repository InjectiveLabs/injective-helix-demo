<script lang="ts" setup>
import { Status, StatusType, BigNumberInBase } from '@injectivelabs/utils'
import { legacyWHDenoms } from '@/app/data/token'

definePageMeta({
  middleware: ['connected']
})

const appStore = useAppStore()
const walletStore = useWalletStore()
const accountStore = useAccountStore()
const gridStrategyStore = useGridStrategyStore()
const { $onError } = useNuxtApp()

const status = reactive(new Status(StatusType.Loading))

const legacyWHBankAssets = computed(() =>
  accountStore.bankBalances
    .filter(
      ({ denom, amount }) =>
        new BigNumberInBase(amount).gt(0) &&
        legacyWHDenoms.find((legacyDenom) => legacyDenom === denom)
    )
    .map(({ denom }) => denom)
)

const legacyWHSubaccountAssets = computed(() =>
  Object.values(accountStore.subaccountBalancesMap)
    .flat()
    .filter(
      ({ denom, totalBalance }) =>
        new BigNumberInBase(totalBalance).gt(0) &&
        legacyWHDenoms.find((legacyDenom) => legacyDenom === denom)
    )
    .map(({ denom }) => denom)
)

onMounted(() => {
  Promise.all([
    accountStore.fetchAccountPortfolioBalances(),
    accountStore.streamBankBalance(),
    accountStore.streamSubaccountBalance(),
    gridStrategyStore.fetchAllStrategies()
  ])
    .then(() => {
      //
    })
    .catch($onError)
    .finally(() => status.setIdle())
})

useIntervalFn(appStore.pollMarkets, 1000 * 10)
</script>

<template>
  <AppHocLoading
    class="h-full"
    :status="status"
    :is-loading="!walletStore.isUserWalletConnected"
  >
    <div class="container">
      <div class="w-full mx-auto 3xl:w-11/12 4xl:w-10/12 relative">
        <PartialsAccount />
      </div>

      <PartialsLegacyWormholeBanner
        v-if="
          legacyWHBankAssets.length > 0 || legacyWHSubaccountAssets.length > 0
        "
      >
        <template #default>
          <div class="flex flex-col">
            <div
              class="flex flex-col lg:flex-row justify-center items-center gap-4"
            >
              <i18n-t keypath="common.legacy.attentionBanner" tag="p">
                <template #attention>
                  <span class="font-bold">{{
                    $t('common.legacy.attention')
                  }}</span>
                </template>
                <template #learnMore>
                  <PartialsLegacyWormholeLearnMore />
                </template>
              </i18n-t>

              <PartialsLegacyWormholeButton
                v-if="legacyWHSubaccountAssets.length === 0"
                is-migration
              >
                <div class="flex items-center justify-center gap-1">
                  <span class="whitespace-nowrap">
                    {{ $t('common.legacy.goToTokenMigrationPage') }}
                  </span>

                  <SharedIcon
                    name="arrow"
                    class="font-bold w-3 h-3 min-w-3 rotate-180"
                  />
                </div>
              </PartialsLegacyWormholeButton>
            </div>
          </div>
        </template>
      </PartialsLegacyWormholeBanner>
    </div>
  </AppHocLoading>
</template>
