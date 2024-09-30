<script setup lang="ts">
import { dataCyTag } from '@shared/utils'
import { UiMarketWithToken, CommonCyTags } from '@/types'

const props = withDefaults(
  defineProps<{
    market: UiMarketWithToken
  }>(),
  {}
)

const appStore = useAppStore()

const isLocked = useScrollLock(document.documentElement)

const el = ref<HTMLElement | null>(null)
const toggleEl = ref<HTMLElement | null>(null)

const isBiudlPerpMarket = computed(
  () => props.market.slug === 'buidl-usdt-perp'
)

const is2024ElectionPerpMarket = computed(
  () => props.market.slug === '2024election-perp'
)

function toggleOpen() {
  appStore.marketsOpen = !appStore.marketsOpen
}

onClickOutside(
  el,
  () => {
    closeMarketSection()
  },
  { ignore: [toggleEl] }
)

function closeMarketSection() {
  appStore.marketsOpen = false
}

watch(
  () => appStore.marketsOpen,
  (isOpen) => {
    isLocked.value = isOpen
  }
)
</script>

<template>
  <div
    ref="toggleEl"
    class="flex basis-[400px] max-lg:py-4 items-center pr-4 border-r hover:bg-brand-875 cursor-pointer select-none"
    @click="toggleOpen"
  >
    <CommonTokenIcon class="mx-4" v-bind="{ token: market.baseToken }" />
    <div class="flex items-center space-x-2 justify-center relative">
      <div>
        <CommonHeaderTooltip
          :is-disabled="!isBiudlPerpMarket && !is2024ElectionPerpMarket"
        >
          <span
            class="uppercase tracking-wider font-bold text-sm"
            :data-cy="dataCyTag(CommonCyTags.MarketPair)"
          >
            {{ market.ticker }}
          </span>

          <template #tooltip>
            <i18n-t v-if="isBiudlPerpMarket" keypath="markets.buidlTooltip">
              <template #docs>
                <NuxtLink
                  target="_blank"
                  class="text-blue-500 hover:text-opacity-90"
                  to="https://docs.trading.injective.network/learn/index-perps"
                >
                  {{ $t('common.docs') }}
                </NuxtLink>
              </template>
            </i18n-t>

            <i18n-t v-else keypath="markets.2024ElectionTooltip">
              <template #docs>
                <NuxtLink
                  target="_blank"
                  class="text-blue-500 hover:text-opacity-90"
                  to="https://docs.trading.injective.network/learn/election-perpetual-futures"
                >
                  {{ $t('common.tradingDocs') }}
                </NuxtLink>
              </template>
            </i18n-t>
          </template>
        </CommonHeaderTooltip>

        <p class="text-gray-400 text-xs">{{ market.baseToken.name }}</p>
      </div>

      <div class="absolute left-full">
        <SharedIcon
          v-if="market.isVerified"
          name="check-shield"
          is-sm
          class="text-green-500 w-4 h-4 min-w-4"
        />
      </div>
    </div>

    <div class="text-gray-400 ml-auto flex items-center">
      <div
        class="ml-10 mr-4 text-sm"
        :data-cy="dataCyTag(CommonCyTags.MarketDropdown)"
      >
        {{ $t('trade.allMarkets') }}
      </div>

      <SharedIcon name="chevron" is-sm class="-rotate-90" />
    </div>
  </div>

  <div
    v-if="appStore.marketsOpen"
    class="absolute backdrop-blur-sm top-full z-30 w-screen left-0 flex"
    @keydown.escape="closeMarketSection"
  >
    <div
      ref="el"
      class="basis-[800px] min-w-0 overflow-y-auto bg-brand-900 border h-[calc(100vh-132px)]"
      @click.stop
    >
      <PartialsTradeMarkets />
    </div>
  </div>
</template>
