<script lang="ts" setup>
import { metaTags } from '@/nuxt-config/meta'
import type { BigNumberInBase } from '@injectivelabs/utils'

const referralStore = useReferralStore()

withDefaults(
  defineProps<{
    isLong?: boolean
    isLoading?: boolean
    selectedCharacter: string
    leverage?: BigNumberInBase
  }>(),
  {
    isLong: undefined,
    leverage: undefined
  }
)

const cardWidth = 512
const cardHeight = 365

const scale = ref(1)

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
          <slot name="icon"></slot>

          <span class="text-sm">
            <slot name="ticker"></slot>
          </span>

          <div
            v-if="isLong !== undefined"
            class="py-0.5 px-2 flex items-center gap-1 rounded text-xs font-semibold tracking-wide"
            :class="[
              isLong
                ? 'text-green-500 bg-green-500/30'
                : 'text-red-500 bg-red-500/30'
            ]"
          >
            <span v-if="isLong">{{ $t('trade.long') }}</span>
            <span v-else>{{ $t('trade.short') }}</span>
            <span v-if="leverage">{{ leverage.toFormat(2) }}&times;</span>
          </div>
        </div>

        <span v-if="$slots.performance">
          <span class="font-bold text-2xl md:text-[32px] block leading-tight">
            <slot name="performance"></slot>
          </span>
          <slot name="performanceLabel">{{ $t('common.pnl') }}</slot>
        </span>

        <div class="flex gap-3 text-sm mt-6">
          <div v-if="$slots.entryPrice" class="flex flex-col gap-1">
            <span class="text-coolGray-450 font-medium">
              {{ $t('trade.sharePnlModal.entryPrice') }}
            </span>
            <slot name="entryPrice"></slot>
          </div>

          <div v-if="$slots.exitPrice" class="flex flex-col gap-1">
            <span class="text-coolGray-450 font-medium">
              {{ $t('trade.sharePnlModal.exitPrice') }}
            </span>
            <slot name="exitPrice"></slot>
          </div>

          <div v-if="$slots.markPrice" class="flex flex-col gap-1">
            <span class="text-coolGray-450 font-medium">
              {{ $t('trade.sharePnlModal.markPrice') }}
            </span>
            <slot name="markPrice"></slot>
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
