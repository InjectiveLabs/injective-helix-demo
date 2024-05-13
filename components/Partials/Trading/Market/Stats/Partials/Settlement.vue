<script lang="ts" setup>
import { format } from 'date-fns'
import { SharedUiBinaryOptionsMarket } from '@shared/types'
import { OLP_TIME_STAMP_FORMAT } from '@/app/utils/constants'

const props = defineProps({
  market: {
    type: Object as PropType<SharedUiBinaryOptionsMarket>,
    required: true
  }
})

const expiredAt = computed(() =>
  format(
    (props.market as SharedUiBinaryOptionsMarket).settlementTimestamp * 1000,
    OLP_TIME_STAMP_FORMAT
  )
)
</script>

<template>
  <CommonMarketInfo
    :title="$t('trade.binaryOptions.settlement')"
    :tooltip="$t('trade.binaryOptions.settlement_tooltip')"
  >
    {{ expiredAt }}
  </CommonMarketInfo>
</template>
