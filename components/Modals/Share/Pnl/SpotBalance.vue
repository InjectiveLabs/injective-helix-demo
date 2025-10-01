<script lang="ts" setup>
import { ZERO_IN_BASE } from '@shared/utils/constant'
import { BigNumberInBase } from '@injectivelabs/utils'
import { UI_DEFAULT_MIN_DISPLAY_DECIMALS } from '@/app/utils/constants'
import { Modal } from '@/types'
import type { TokenStatic } from '@injectivelabs/sdk-ts'

const archiverStore = useArchiverStore()
const sharedTokenStore = useSharedTokenStore()

const props = withDefaults(
  defineProps<{
    token: TokenStatic
  }>(),
  {}
)

const emit = defineEmits<{
  'on:close': []
}>()

const ticker = computed(() => `${props.token.symbol} SPOT`)

const currentTokenPriceToBigNumber = computed(
  () => new BigNumberInBase(sharedTokenStore.tokenUsdPrice(props.token))
)
const roiData = computed(() =>
  archiverStore.spotROIByBaseDenom(props.token.denom)
)

const priceDecimals = computed(
  () => props.token.decimals || UI_DEFAULT_MIN_DISPLAY_DECIMALS
)

function onClose() {
  emit('on:close')
}
</script>

<template>
  <ModalsSharePnlBase
    v-bind="{
      modal: Modal.ShareBalancePnl,
      filenamePrefix: 'Spot-PNL'
    }"
    @on:close="onClose"
  >
    <template #canvas="{ isDownloading, selectedCharacter }">
      <ModalsSharePnlCanvasContent
        v-bind="{
          isLoading: isDownloading,
          selectedCharacter: selectedCharacter
        }"
      >
        <template #icon>
          <CommonTokenIcon
            class="size-5 min-w-5"
            v-bind="{ token: props.token }"
          />
        </template>

        <template #ticker>{{ ticker }}</template>

        <template #performance>
          <span
            :class="{
              'text-red-500': roiData?.roiPercentage.lt(0),
              'text-green-500': roiData?.roiPercentage.gte(0)
            }"
          >
            {{
              (roiData?.roiPercentage.gte(0) ? '+' : '') +
              roiData?.roiPercentage.toFormat(2)
            }}%
          </span>
        </template>

        <template #performanceLabel>{{ $t('common.roi') }}</template>

        <template #entryPrice>
          <SharedAmount
            v-bind="{
              shouldAbbreviate: false,
              noTrailingZeros: roiData?.averageEntryPrice.lt(1),
              amount: roiData?.averageEntryPrice || ZERO_IN_BASE,
              decimals: roiData?.averageEntryPrice.gte(1)
                ? UI_DEFAULT_MIN_DISPLAY_DECIMALS
                : priceDecimals
            }"
          />
        </template>

        <template #markPrice>
          <SharedAmount
            v-bind="{
              shouldAbbreviate: false,
              amount: currentTokenPriceToBigNumber,
              noTrailingZeros: currentTokenPriceToBigNumber.lt(1),
              decimals: currentTokenPriceToBigNumber.gte(1)
                ? UI_DEFAULT_MIN_DISPLAY_DECIMALS
                : priceDecimals
            }"
          />
        </template>
      </ModalsSharePnlCanvasContent>
    </template>
  </ModalsSharePnlBase>
</template>
