<script lang="ts" setup>
import { metaTags } from '@/nuxt-config/meta'
import { TradeDirection } from '@injectivelabs/ts-types'
import { UI_DEFAULT_MIN_DISPLAY_DECIMALS } from '@/app/utils/constants'
import type { PositionV2 } from '@injectivelabs/sdk-ts'

const referralStore = useReferralStore()

const props = withDefaults(
  defineProps<{
    isLoading?: boolean
    position: PositionV2
    selectedCharacter: string
  }>(),
  {}
)

const { pnl, market, percentagePnl, price, markPrice, effectiveLeverage } =
  useDerivativePosition(computed(() => props.position))

const cardWidth = 512
const cardHeight = 365

const scale = ref(1)

const marketPriceDecimals = computed(
  () => market.value?.priceDecimals || UI_DEFAULT_MIN_DISPLAY_DECIMALS
)

const qrLink = computed(() => {
  const refCode = referralStore.referralDetails?.referrerCode
  const referralLink = refCode ? `${metaTags.url}/ref/${refCode}` : ''

  return referralLink || metaTags.url
})

onMounted(() => {
  updateScale()
  window.addEventListener('resize', updateScale)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateScale)
})

function updateScale() {
  const windowWidth = window.innerWidth - 64 // 64px = modal's padding + margin on mobile screen
  scale.value = Math.min(1, windowWidth / cardWidth)
}
</script>

<template>
  <div
    class="relative overflow-hidden"
    :style="{
      width: `${cardWidth * scale}px`,
      height: `${cardHeight * scale}px`
    }"
  >
    <div
      :style="{
        width: `${cardWidth}px`,
        height: `${cardHeight}px`,
        transform: `scale(${scale})`
      }"
      :class="{ 'rounded-lg': !isLoading }"
      class="relative p-4 bg-[linear-gradient(111deg,_#1F1F24_25%,_#28284C_94%)] origin-top-left"
    >
      <div class="relative z-10">
        <div class="flex items-center gap-2.5">
          <AssetLogo class="w-auto h-5" alt="Helix" />
          <AssetLogoText class="block h-4" />
        </div>

        <div class="flex items-center gap-2 mt-3 mb-4">
          <CommonTokenIcon
            class="w-5 h-5 min-w-5"
            v-bind="{ token: market?.baseToken }"
          />

          <span class="text-sm">
            {{ position.ticker }}
          </span>

          <div
            class="py-0.5 px-2 flex items-center gap-1 rounded text-xs font-semibold tracking-wide"
            :class="[
              position.direction === TradeDirection.Long
                ? 'text-green-500 bg-green-500/30'
                : 'text-red-500 bg-red-500/30'
            ]"
          >
            <span v-if="position.direction === TradeDirection.Long">
              {{ $t('trade.long') }}
            </span>
            <span v-else>{{ $t('trade.short') }}</span>
            <span>{{ effectiveLeverage.toFormat(2) }}&times;</span>
          </div>
        </div>

        <span
          class="font-bold text-2xl md:text-[32px] block leading-tight"
          :class="{
            'text-red-500': pnl.lt(0),
            'text-green-500': pnl.gte(0)
          }"
        >
          {{ (percentagePnl.gte(0) ? '+' : '') + percentagePnl.toFormat(2) }}%
        </span>

        <span>{{ $t('common.pnl') }}</span>

        <div class="flex gap-3 text-sm mt-6">
          <div class="flex flex-col gap-1">
            <span class="text-coolGray-450 font-medium">
              {{ $t('trade.sharePnlModal.entryPrice') }}
            </span>
            <SharedAmount
              v-bind="{
                amount: price,
                noTrailingZeros: price.lt(1),
                decimals: price.gte(1)
                  ? UI_DEFAULT_MIN_DISPLAY_DECIMALS
                  : marketPriceDecimals
              }"
            />
          </div>

          <div class="flex flex-col gap-1">
            <span class="text-coolGray-450 font-medium">
              {{ $t('trade.sharePnlModal.markPrice') }}
            </span>
            <SharedAmount
              v-bind="{
                amount: markPrice,
                noTrailingZeros: price.lt(1),
                decimals: price.gte(1)
                  ? UI_DEFAULT_MIN_DISPLAY_DECIMALS
                  : marketPriceDecimals
              }"
            />
          </div>
        </div>

        <div class="mt-8">
          <PartialsCommonHelixQRCode
            v-bind="{ qrLink }"
            class="rounded-lg size-[80px] !p-1"
          />

          <p class="mt-1 text-xs font-semibold">{{ qrLink }}</p>
        </div>
      </div>

      <img
        alt="Share Character"
        class="absolute right-0 bottom-0 w-64"
        :src="`/images/modal/share-pnl/${selectedCharacter}.webp`"
      />
    </div>
  </div>
</template>
