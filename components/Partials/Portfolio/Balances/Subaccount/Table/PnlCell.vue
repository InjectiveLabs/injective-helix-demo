<script setup lang="ts">
import { DEFAULT_PERCENTAGE_DECIMALS } from '@shared/utils/constant'
import { PortfolioCyTags } from '@/types'
import type { TokenStatic } from '@injectivelabs/sdk-ts'

const accountStore = useAccountStore()

const props = withDefaults(
  defineProps<{
    token: TokenStatic
    isMobile?: boolean
  }>(),
  {}
)

const emit = defineEmits<{
  'balance:share': [token: TokenStatic]
}>()

const spotRoi = useSpotRoi(props.token)

const showPnlAndRoi = computed(() => !accountStore.hasMultipleSubaccounts)

function shareBalance(token: TokenStatic) {
  emit('balance:share', token)
}
</script>

<template>
  <div
    v-if="!!spotRoi && showPnlAndRoi"
    class="flex items-center space-x-1"
    :class="{ 'justify-end': !isMobile }"
  >
    <SharedAmountUsd
      v-if="!spotRoi.pnl.isZero()"
      v-bind="{
        amount: spotRoi.pnl
      }"
      :class="getColorClassForChange(spotRoi.pnl)"
      :data-cy="
        !isMobile ? dataCyTag(PortfolioCyTags.BalanceUnrealisedPnl) : undefined
      "
    >
      <template #prefix>$</template>
    </SharedAmountUsd>
    <span v-else>&mdash;</span>

    <template v-if="!spotRoi.roiPercentage.isZero()">
      <span :class="getColorClassForChange(spotRoi.roiPercentage)">
        (<SharedAmount
          v-bind="{
            amount: spotRoi.roiPercentage,
            decimals: DEFAULT_PERCENTAGE_DECIMALS
          }"
        />%)
      </span>

      <PartialsPortfolioBalancesSubaccountTableShare
        :token="token"
        @balance:share="shareBalance"
      />
    </template>
  </div>
  <span v-else>&mdash;</span>
</template>
