<script lang="ts" setup>
import { ROUTES } from '@/app/utils/constants'

const route = useRoute()

const isTradingRoute = computed(() =>
  [
    ...ROUTES.spotMarketRouteNames,
    ...ROUTES.derivativeMarketRouteNames
  ].includes(route.name as string)
)
</script>
<template>
  <div class="ml-auto hidden lg:block">
    <BaseHoverMenu
      popper-class="flex flex-col flex-wrap w-80 bg-gray-850 shadow-dropdown rounded-lg"
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
        <div class="">
          <LayoutPreferencesProMode />
          <LayoutPreferencesTradingLayout v-if="isTradingRoute" />
        </div>
      </template>
    </BaseHoverMenu>
  </div>
</template>
