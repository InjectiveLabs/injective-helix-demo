<script lang="ts" setup>
import { PropType } from 'vue'
import { format } from 'date-fns'
import {
  UiDerivativeMarketWithToken,
  UiBinaryOptionsMarketWithToken
} from '@injectivelabs/sdk-ui-ts'
import { DMM_TIME_STAMP_FORMAT } from '@/app/utils/constants'

const props = defineProps({
  market: {
    type: Object as PropType<UiDerivativeMarketWithToken>,
    required: true
  }
})

const expiredAt = computed(() =>
  format(
    (props.market as UiBinaryOptionsMarketWithToken).settlementTimestamp * 1000,
    DMM_TIME_STAMP_FORMAT
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
