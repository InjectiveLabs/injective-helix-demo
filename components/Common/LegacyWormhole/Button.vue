<script lang="ts" setup>
import { RouteLocationNamedRaw } from 'vue-router'
import { getNewMarketTickerFromWHDenom } from '@/app/utils/market'
import { getBridgeUrl } from '@/app/utils/network'

const props = defineProps({
  isMigration: Boolean,

  denom: {
    type: String,
    default: ''
  },

  to: {
    type: Object as PropType<RouteLocationNamedRaw>,
    default: () => {}
  }
})

const link = computed(() => {
  if (props.to) {
    return props.to
  }

  if (props.isMigration) {
    return `${getBridgeUrl()}/wormhole-migration`
  }
})
</script>

<template>
  <NuxtLink
    :to="link"
    :target="isMigration ? '_blank' : '_self'"
    class="inline-block bg-orange-300 rounded-[4px] px-1.5 text-gray-925 font-semibold leading-6 text-sm"
  >
    <slot>
      <div class="flex justify-center items-center">
        <span>
          {{
            $t('common.legacy.goToNewMarket', {
              market: getNewMarketTickerFromWHDenom(props.denom || '')
            })
          }}
        </span>

        <BaseIcon name="arrow" class="ml-1 w-3 h-3 min-w-3 rotate-180" />
      </div>
    </slot>
  </NuxtLink>
</template>
