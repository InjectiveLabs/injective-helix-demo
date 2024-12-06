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
    <div class="mx-auto max-w-7xl pt-16 pb-10 px-4 max-lg:pt-8">
      <h3
        class="text-3xl font-semibold"
        :data-cy="dataCyTag(MarketCyTags.HeaderLabel)"
      >
        {{ $t('trade.markets') }}
      </h3>

      <PartialsMarketsOverview
        v-bind="{ markets: marketsWithSummaryAndVolumeInUsd }"
        class="mt-8"
      />

      <div class="max-w-full">
        <div
          class="border-b-2 border-[#181E31] my-4 flex justify-between items-end flex-wrap max-lg:mt-6"
        >
          <div
            v-if="sm"
            class="flex max-lg:w-full max-lg:border-b-2 max-lg:border-bg-[#181E31]"
          >
            <AppButtonSelect
              v-for="value in Object.values(MarketTypeOption)"
              :key="value"
              v-model="activeType"
              v-bind="{ value }"
              class="relative capitalize text-coolGray-450 px-4 py-3 text-xs font-medium whitespace-nowrap flex items-center gap-2.5"
              active-classes="!text-white"
              :data-cy="`${dataCyTag(MarketCyTags.MarketType)}-${value}`"
              @update:model-value="onMarketTypeChange"
            >
              <template #default="{ isActive }">
                <UIcon
                  v-if="value === MarketTypeOption.Favorites"
                  :name="NuxtUiIcons.StarOutline"
                  class="size-4"
                />
                {{ value }}

                <span
                  class="h-0.5 w-full absolute z-[1] -bottom-0.5 left-1/2 -translate-x-1/2"
                  :class="[isActive ? 'bg-blue-500' : 'bg-[#181E31]']"
                />
              </template>
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
              class="w-full flex items-center border border-transparent rounded-md p-1"
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
                  class="size-5 text-coolGray-450"
                />
              </div>
            </label>
          </div>
        </div>
      </div>

      <div class="max-w-full mt-4 lg:mb-2">
        <div class="flex gap-2 justify-between flex-wrap max-sm:flex-col">
          <div
            v-if="!marketTypeOptionsToHideCategory.includes(activeType)"
            class="sm:flex space-x-2 max-sm:w-full items-center"
          >
            <template v-if="sm">
              <AppButtonSelect
                v-for="value in Object.values(MarketCategoryType)"
                :key="value"
                v-model="activeCategory"
                v-bind="{ value }"
                class="text-xs bg-blue-500 bg-opacity-20 opacity-50 py-1 px-2 tracking-wider capitalize rounded text-blue-550"
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

          <div class="flex mt-2 lg:mt-0 flex-wrap">
            <div class="flex rounded border border-[#181E31]">
              <AppButtonSelect
                v-for="value in Object.values(MarketQuoteType)"
                :key="value"
                v-model="activeQuote"
                v-bind="{ value }"
                class="p-2 text-white opacity-50 text-xs uppercase hover:opacity-75"
                active-classes="!bg-[#181E31] opacity-100"
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
              class="md:ml-4 flex items-center text-coolGray-450"
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
