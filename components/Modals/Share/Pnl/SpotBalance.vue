<script lang="ts" setup>
import { ZERO_IN_BASE } from '@shared/utils/constant'
import { BigNumberInBase } from '@injectivelabs/utils'
import { UI_DEFAULT_MIN_DISPLAY_DECIMALS } from '@/app/utils/constants'
import { Modal } from '@/types'
import type { TokenStatic } from '@injectivelabs/sdk-ts'

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

const currentTokenPrice = computed(() =>
  sharedTokenStore.tokenUsdPrice(props.token)
)
const currentTokenPriceToBigNumber = computed(
  () => new BigNumberInBase(currentTokenPrice.value)
)

const spotRoi = useSpotRoi(props.token)

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
      filenamePrefix: 'Spot-PNL',
      modal: Modal.ShareBalancePnl
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
            :class="
              getColorClassForChange(spotRoi?.roiPercentage || ZERO_IN_BASE)
            "
          >
            {{
              (spotRoi?.roiPercentage?.gte(0) ? '+' : '') +
              spotRoi?.roiPercentage?.toFormat(2)
            }}%
          </span>
        </template>

        <template #performanceLabel>{{ $t('common.roi') }}</template>

        <template #entryPrice>
          <SharedAmount
            v-bind="{
              shouldAbbreviate: false,
              noTrailingZeros: spotRoi?.averageEntryPrice?.lt(1),
              amount: spotRoi?.averageEntryPrice || ZERO_IN_BASE,
              decimals: spotRoi?.averageEntryPrice?.gte(1)
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
