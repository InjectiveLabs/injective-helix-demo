<script lang="ts" setup>
import { dataCyTag } from '@shared/utils'
import { NuxtUiIcons } from '@shared/types'
import { Status, StatusType, BigNumberInBase } from '@injectivelabs/utils'
import { marketTypeOptionsToHideCategory } from '@/app/data/market'
import {
  MarketCyTags,
  MarketQuoteType,
  MarketTypeOption,
  MarketCategoryType,
  UnknownTokenStatusKey
} from '@/types'

const route = useRoute()
const appStore = useAppStore()
const spotStore = useSpotStore()
const { $onError } = useNuxtApp()
const { sm } = useTwBreakpoints()
const tokenStore = useTokenStore()
const exchangeStore = useExchangeStore()
const derivativeStore = useDerivativeStore()

const mobileMarketTypeOption = Object.values(MarketTypeOption).map((value) => ({
  label: value,
  value
}))

const mobileMarketCategoryType = Object.entries(MarketCategoryType).map(
  ([key, value]) => ({ label: key, value })
)

const search = ref('')
const activeType = ref(setTypeFromQuery())
const activeCategory = ref(MarketCategoryType.All)
const activeQuote = ref(MarketQuoteType.All)
const isLowVolumeMarketsVisible = ref(false)
const unverifiedMarketsStatus = reactive(new Status(StatusType.Idle))

const marketsWithSummaryAndVolumeInUsd = computed(() =>
  [
    ...spotStore.marketsWithSummary,
    ...derivativeStore.marketsWithSummary,
    ...exchangeStore.upcomingMarketsWithSummary,
    ...exchangeStore.deprecatedMarketsWithSummary
  ]
    .map(({ market, summary }) => {
      const quoteTokenUsdPrice = new BigNumberInBase(
        tokenStore.tokenUsdPrice(market.quoteToken)
      )

      return {
        market,
        summary,
        volumeInUsd: quoteTokenUsdPrice.multipliedBy(summary?.volume || '0')
      }
    })
    .filter(({ summary }) => summary)
)

onMounted(() => {
  getQuoteTokenPrice()
})

function getQuoteTokenPrice() {
  Promise.all([appStore.pollMarkets()]).catch($onError)
}

async function onMarketTypeChange(type: string) {
  if ((type as MarketTypeOption) !== MarketTypeOption.Permissionless) {
    return
  }

  isLowVolumeMarketsVisible.value = true

  unverifiedMarketsStatus.setLoading()

  await until(unknownTokenStatus).toMatch((status) => status.isIdle())

  spotStore
    .fetchMarkets()
    .catch($onError)
    .finally(() => unverifiedMarketsStatus.setIdle())
}

useIntervalFn(() => getQuoteTokenPrice(), 10 * 1000)

const unknownTokenStatus = inject(
  UnknownTokenStatusKey,
  new Status(StatusType.Loading)
)

function setTypeFromQuery() {
  if (
    Object.values(MarketTypeOption).includes(
      route.query.type as MarketTypeOption
    )
  ) {
    return route.query.type as MarketTypeOption
  }

  return MarketTypeOption.All
}
</script>

<template>
  <div>
    <div class="mx-auto max-w-7xl py-10 px-4">
      <h3
        class="text-2xl font-semibold"
        :data-cy="dataCyTag(MarketCyTags.HeaderLabel)"
      >
        {{ $t('trade.markets') }}
      </h3>

      <PartialsMarketsOverview
        v-bind="{ markets: marketsWithSummaryAndVolumeInUsd }"
        class="my-10"
      />

      <div class="max-w-full">
        <div
          class="border-b border-brand-700 my-4 flex justify-between items-end flex-wrap"
        >
          <div v-if="sm" class="flex overflow-x-auto">
            <AppButtonSelect
              v-for="value in Object.values(MarketTypeOption)"
              :key="value"
              v-model="activeType"
              v-bind="{ value }"
              class="capitalize text-coolGray-200 px-4 py-2 text-sm border-b font-medium whitespace-nowrap"
              active-classes="border-blue-500 !text-blue-500"
              :data-cy="`${dataCyTag(MarketCyTags.MarketType)}-${value}`"
              @update:model-value="onMarketTypeChange"
            >
              {{ value }}
            </AppButtonSelect>
          </div>
          <div v-else class="w-full">
            <p class="text-xs text-gray-500 mb-2">
              {{ $t('common.marketType') }}
            </p>
            <USelectMenu
              v-model="activeType"
              value-attribute="value"
              :options="mobileMarketTypeOption"
              :ui-menu="{
                select: 'capitalize',
                option: { base: 'capitalize' }
              }"
            />
          </div>

          <div class="flex max-lg:w-full">
            <label
              class="w-full flex items-center border border-transparent focus-within:border-brand-850 rounded-md p-1"
            >
              <input
                v-model="search"
                type="text"
                class="focus:outline-none bg-transparent p-1 px-3 w-full"
                :data-cy="dataCyTag(MarketCyTags.MarketSearch)"
              />

              <div class="flex items-center pr-3">
                <UIcon
                  :name="NuxtUiIcons.Search"
                  class="h-6 w-6 min-w-6 text-coolGray-500"
                />
              </div>
            </label>
          </div>
        </div>
      </div>

      <div class="max-w-full my-6">
        <div class="flex gap-x-2 justify-between flex-wrap max-sm:flex-col">
          <div
            v-if="!marketTypeOptionsToHideCategory.includes(activeType)"
            class="sm:flex space-x-2 max-sm:w-full"
          >
            <template v-if="sm">
              <AppButtonSelect
                v-for="value in Object.values(MarketCategoryType)"
                :key="value"
                v-model="activeCategory"
                v-bind="{ value }"
                class="text-xs bg-blue-500 bg-opacity-20 opacity-50 py-1 px-3 tracking-wider capitalize font-semibold rounded-md text-blue-550"
                active-classes="opacity-100"
                :data-cy="`${dataCyTag(MarketCyTags.MarketChain)}-${value}`"
              >
                {{ value }}
              </AppButtonSelect>
            </template>

            <div v-else>
              <p class="text-xs text-gray-500 mb-2">
                {{ $t('common.marketCategory') }}
              </p>
              <USelectMenu
                v-model="activeCategory"
                value-attribute="value"
                :options="mobileMarketCategoryType"
              />
            </div>
          </div>

          <div
            v-if="activeType === MarketTypeOption.Permissionless"
            class="flex items-center gap-x-2 text-coolGray-500"
          >
            <UIcon :name="NuxtUiIcons.WarningOutline" class="w-5 h-5 min-w-5" />
            <span class="text-sm">{{
              $t('markets.permisionlessWarning')
            }}</span>
          </div>

          <div class="flex gap-x-3 mt-2 lg:mt-0 flex-wrap">
            <div class="flex rounded border">
              <AppButtonSelect
                v-for="value in Object.values(MarketQuoteType)"
                :key="value"
                v-model="activeQuote"
                v-bind="{ value }"
                class="py-1 px-3 text-coolGray-400 text-xs uppercase hover:bg-brand-875"
                active-classes="text-white !bg-brand-800"
                :data-cy="`${dataCyTag(
                  MarketCyTags.MarketQuoteToken
                )}-${value}`"
              >
                {{ value }}
              </AppButtonSelect>
            </div>

            <AppCheckbox2
              v-if="activeType !== MarketTypeOption.Permissionless"
              v-model="isLowVolumeMarketsVisible"
              class="md:ml-4 flex items-center"
              is-sm
            >
              {{ $t('markets.showLowVol') }}
            </AppCheckbox2>
          </div>
        </div>
      </div>

      <PartialsMarkets
        v-bind="{
          search,
          activeType,
          activeQuote,
          activeCategory,
          isLowVolumeMarketsVisible,
          markets: marketsWithSummaryAndVolumeInUsd,
          isLoading: unverifiedMarketsStatus.isLoading()
        }"
      />
    </div>
  </div>
</template>
