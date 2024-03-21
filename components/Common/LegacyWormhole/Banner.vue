<script lang="ts" setup>
import { legacyWHDenoms } from '@/app/data/token'

const spotStore = useSpotStore()

const props = defineProps({
  isDisabled: Boolean
})

const isExpanded = ref(false)

const affectedMarkets = computed(() =>
  spotStore.markets.filter((market) =>
    legacyWHDenoms.includes(market.baseToken.denom)
  )
)

function onToggleExpanded() {
  if (props.isDisabled) {
    return
  }

  isExpanded.value = !isExpanded.value
}
</script>

<template>
  <ClientOnly>
    <Teleport to="#legacy-wormhole-banner">
      <div
        class="w-full py-3 px-4 text-gray-925 font-medium bg-orange-200 flex justify-between items-start text-sm leading-6"
        @click="onToggleExpanded"
      >
        <div class="w-full">
          <slot v-bind="{ isExpanded, affectedMarkets }" />
        </div>

        <slot v-if="$slots['add-on']" v-bind="{ isExpanded }" name="add-on" />
      </div>
    </Teleport>
  </ClientOnly>
</template>
