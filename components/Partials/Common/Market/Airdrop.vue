<script lang="ts" setup>
import { PropType } from 'vue'
import {
  UiDerivativeMarketWithToken,
  UiSpotMarketWithToken
} from '@injectivelabs/sdk-ui-ts'
import { isWithinInterval } from 'date-fns'
import { marketPromotions } from '@/app/data/market'

const props = defineProps({
  market: {
    type: Object as PropType<
      UiDerivativeMarketWithToken | UiSpotMarketWithToken
    >,
    required: true
  }
})

const promotion = computed(() => {
  return marketPromotions.find(
    (promotion) => promotion.market === props.market.slug
  )
})

const showPromotion = computed(() => {
  if (!props.market || !promotion.value) {
    return false
  }

  return isWithinInterval(Date.now(), {
    start: promotion.value.start,
    end: promotion.value.end
  })
})

const url = computed(() => {
  if (!promotion.value) {
    return ''
  }

  return promotion.value.url
})
</script>

<template>
  <a v-if="showPromotion" :href="url" target="_blank">
    <div
      class="rounded bg-orange-[#fdba74] py-1 px-1 cursor-pointer flex items-center"
    >
      <span
        class="text-orange-[#c2410c] text-3xs font-bold uppercase whitespace-nowrap"
      >
        &#128293; {{ $t('markets.airdrop') }}
      </span>
    </div>
  </a>
</template>
