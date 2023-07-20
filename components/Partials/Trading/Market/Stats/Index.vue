<script lang="ts" setup>
import { PropType } from 'vue'
import { UiMarketWithToken, UiMarketSummary } from '@/types'

defineProps({
  expanded: Boolean,

  market: {
    type: Object as PropType<UiMarketWithToken>,
    required: true
  },

  summary: {
    type: Object as PropType<UiMarketSummary>,
    required: true
  }
})

const emit = defineEmits<{
  'marketsList:toggle': []
}>()

function handleTokenClick() {
  emit('marketsList:toggle')
}
</script>

<template>
  <CommonCard
    no-top-border-radius
    no-padding
    class="h-full px-4"
    data-cy="trading-page-market-info-component"
  >
    <div
      class="flex justify-between items-center flex-wrap lg:flex-nowrap gap-4 h-full"
    >
      <div
        class="flex mt-2 justify-between items-center w-full lg:w-auto lg:mt-0 gap-6"
      >
        <div class="flex items-center gap-4" @click="handleTokenClick">
          <CommonTokenIcon v-if="market.baseToken" :token="market.baseToken" />

          <div class="leading-none select-none cursor-pointer">
            <p class="text-gray-100 font-semibold text-sm flex items-center">
              <span
                data-cy="trading-page-ticker-name-text-content"
                class="whitespace-nowrap overflow-ellipsis overflow-hidden"
              >
                {{ market.ticker }}
              </span>

              <BaseIcon
                name="chevron"
                class="w-auto h-3 text-gray-500 ml-2 transform transition ease-in-out duration-300"
                :class="[expanded ? 'rotate-90' : '-rotate-90']"
              />
            </p>

            <p class="text-gray-500 text-xs">
              {{ market.baseToken.name }}
            </p>
          </div>

          <PartialsCommonMarketAirdrop :market="market" />
        </div>

        <div class="w-px h-8 border-r hidden lg:block" />

        <PartialsTradingMarketStatsPartialsLastTradedPriceAndChange
          v-if="summary"
          :market="market"
          :summary="summary"
          lg
          is-current-market
          is-stats-bar
        />
      </div>

      <PartialsTradingMarketStatsPartials
        v-if="summary"
        :market="market"
        :summary="summary"
        class="w-full lg:w-auto pb-4 lg:pb-0"
      />

      <div class="ml-auto hidden lg:block">
        <BaseHoverMenu
          popper-class="rounded-lg flex flex-col flex-wrap text-xs absolute w-80 bg-gray-750 shadow-dropdown z-40"
        >
          <template #default>
            <button
              id="layout-preferences-button"
              class="w-6 h-6 cursor-pointer group flex justify-center items-center"
            >
              <BaseIcon
                name="sliders"
                class="text-gray-450 group-hover:text-white w-4 h-4"
              />
            </button>
          </template>

          <template #content>
            <PartialsTradingMarketLayoutPreferences />
          </template>
        </BaseHoverMenu>
      </div>
    </div>
  </CommonCard>
</template>
