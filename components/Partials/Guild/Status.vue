<script lang="ts" setup>
import { GUILD_MIN_AMOUNT } from '@/app/utils/constants'

withDefaults(
  defineProps<{ isActive?: boolean; isCampaignStarted?: boolean }>(),
  {
    isActive: false,
    isCampaignStarted: false
  }
)
</script>

<template>
  <AppDotStatus v-if="!isActive" class="text-coolGray-500">
    <CommonHeaderTooltip
      :tooltip="
        $t('guild.inactiveTooltip', {
          amount: GUILD_MIN_AMOUNT
        })
      "
    >
      <span class="capitalize text-sm">{{ $t('common.inactive') }}</span>
    </CommonHeaderTooltip>
  </AppDotStatus>
  <AppDotStatus v-else-if="isCampaignStarted" v-bind="{ isActive }" />
  <AppDotStatus v-else color="text-orange-500">
    {{ $t('common.ready') }}
  </AppDotStatus>
</template>
