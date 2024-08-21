<script lang="ts" setup>
withDefaults(defineProps<{ isSwapPage: boolean }>(), { isSwapPage: false })
</script>

<template>
  <div
    class="relative overflow-hidden bg-gradient-to-r from-[#6D14F8] to-blue-300 rounded-lg block"
  >
    <img
      v-if="isSwapPage"
      class="absolute w-full object-cover"
      src="/svg/banner_tia.svg"
      alt=""
    />

    <img
      v-else
      class="absolute right-0 object-cover"
      src="/svg/banner_atom.svg"
      alt=""
    />

    <div class="relative flex p-4">
      <div class="flex-1">
        <p v-if="isSwapPage" class="text-xl font-bold">
          {{ $t('liquidity.tiaBannerSwap') }}
        </p>

        <p v-else class="text-xl font-bold">
          {{ $t('liquidity.tiaBannerLiquidity') }}
        </p>

        <NuxtLink
          v-if="isSwapPage"
          to="https://galxe.com/injective/campaign/GCLfyUnGPE"
          target="_blank"
          class="hover:text-blue-200"
        >
          <span>{{ $t('sgt.learnMore') }}</span>
        </NuxtLink>

        <NuxtLink
          v-else
          to="/lp-rewards"
          class="flex items-center hover:text-blue-200"
        >
          <span>{{ $t('liquidity.seeRewards') }}</span>
          <div class="rotate-180 ml-1"><SharedIcon name="arrow" is-sm /></div>
        </NuxtLink>
      </div>

      <div class="self-center">
        <img src="/svg/TIA.svg" alt="" />
      </div>
    </div>
  </div>
</template>
