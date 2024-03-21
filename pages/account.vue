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

const legacyWHSubaccountAssets = computed(() => {
  const assets = Object.values(accountStore.subaccountBalancesMap)
    .flat()
    .filter(
      ({ denom, totalBalance }) =>
        new BigNumberInBase(totalBalance).gt(0) &&
        legacyWHDenoms.find((legacyDenom) => legacyDenom === denom)
    )
    .map(({ denom }) => denom)

  return assets
})

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

      <CommonLegacyWormholeBanner
        v-if="
          legacyWHBankAssets.length > 0 || legacyWHSubaccountAssets.length > 0
        "
        v-bind="{ isDisabled: legacyWHSubaccountAssets.length === 0 }"
      >
        <template #default="{ isExpanded, affectedMarkets }">
          <div class="flex flex-col">
            <div
              class="flex flex-col sm:flex-row justify-center items-center max-w-[1200px] gap-4"
            >
              <i18n-t
                keypath="common.legacy.attentionBanner"
                tag="p"
                :class="{
                  truncate: !isExpanded && legacyWHSubaccountAssets.length > 0
                }"
              >
                <template #attention>
                  <span class="font-bold">{{
                    $t('common.legacy.attention')
                  }}</span>
                </template>
                <template #learnMore>
                  <CommonLegacyWormholeLearnMore />
                </template>
              </i18n-t>

              <CommonLegacyWormholeMigrateButton
                v-if="legacyWHSubaccountAssets.length === 0"
              >
                <div class="flex items-center justify-center gap-1">
                  <span class="whitespace-nowrap">
                    {{ $t('common.legacy.goToTokenMigrationPage') }}
                  </span>

                  <BaseIcon
                    name="arrow"
                    class="font-bold w-3 h-3 min-w-3 rotate-180"
                  />
                </div>
              </CommonLegacyWormholeMigrateButton>
            </div>

            <div v-if="isExpanded" class="flex flex-col">
              <span>
                {{ $t('common.legacy.affectedMarkets') }}
              </span>
              <div
                v-for="{ ticker, marketId } in affectedMarkets"
                :key="marketId"
              >
                {{ `- ${ticker}` }}
              </div>
            </div>
          </div>
        </template>

        <template
          v-if="legacyWHSubaccountAssets.length > 0"
          #add-on="{ isExpanded }"
        >
          <BaseIcon
            name="caret-thin"
            class="font-normal min-w-[12px] w-[12px] h-[12px] mt-1.5 transition-transform duration-300"
            :class="{
              'rotate-90': isExpanded,
              '-rotate-90': !isExpanded
            }"
          />
        </template>
      </CommonLegacyWormholeBanner>
    </div>
  </AppHocLoading>
</template>
