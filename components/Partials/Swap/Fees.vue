<script lang="ts" setup>
import { dataCyTag } from '@shared/utils'
import { NuxtUiIcons } from '@shared/types'
import { MAX_QUOTE_DECIMALS } from '@/app/utils/constants'
import { SwapCyTags } from '@/types'
import type { SwapForm } from '@/types'

const showFeeBreakdown = ref(false)
const formValues = useFormValues<SwapForm>()

const { swapRoutesFees, totalFee } = useSwapFee(formValues)

function toggleShowFeeBreakdown() {
  showFeeBreakdown.value = !showFeeBreakdown.value
}
</script>

<template>
  <span
    class="flex group"
    :class="{ 'cursor-pointer': swapRoutesFees.length > 1 }"
    @click="toggleShowFeeBreakdown"
  >
    <div>
      <div class="flex items-center gap-1 justify-end mb-1">
        <span :data-cy="dataCyTag(SwapCyTags.SwapSummaryFees)">
          <SharedAmount
            v-bind="{
              amount: totalFee,
              shouldAbbreviate: false,
              decimals: MAX_QUOTE_DECIMALS
            }"
          >
            <template #prefix>{{ `~$` }}</template>
          </SharedAmount>
        </span>
      </div>

      <div v-if="swapRoutesFees.length > 1">
        <div
          v-for="(fee, index) in swapRoutesFees"
          :key="`swap-route-fee-${index}`"
          class="grid grid-cols-2 gap-10 items-center h-0 opacity-0 transition-all duration-200 text-coolGray-500 cursor-text"
          :class="{ 'h-auto opacity-100': showFeeBreakdown }"
        >
          <div class="flex items-center justify-start">
            <span
              v-for="symbol in fee.symbols"
              :key="symbol.from"
              class="flex items-center"
            >
              <span>{{ symbol.from }}</span>

              <UIcon
                :name="NuxtUiIcons.ArrowLeft"
                class="rotate-180 w-4 h-4 mx-1 !cursor-text"
              />
              <span>{{ symbol.to }}</span>
            </span>
          </div>

          <div class="flex justify-end">{{ `~$${fee.usdAmount}` }}</div>
        </div>
      </div>
    </div>

    <UIcon
      v-if="swapRoutesFees.length > 1"
      :name="NuxtUiIcons.ChevronDown"
      class="w-3.5 h-3.5 mt-0.5 ml-1 transition-transform duration-300"
      :class="{ 'rotate-180': showFeeBreakdown }"
    />
  </span>
</template>
