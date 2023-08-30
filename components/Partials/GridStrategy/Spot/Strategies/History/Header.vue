<template>
  <div class="grid grid-cols-8 text-xs p-4 gap-2">
    <div>{{ $t('sgt.time') }}</div>
    <div>{{ $t('sgt.market') }}</div>
    <div class="text-right">{{ $t('sgt.lowerBound') }}</div>
    <div class="text-right">{{ $t('sgt.upperBound') }}</div>
    <div class="text-right">
      <CommonHeaderTooltip :tooltip="$t('sgt.amountsMayBeLessTooltip')">
        <span class="text-white">{{ $t('sgt.investment') }}</span>
      </CommonHeaderTooltip>
    </div>
    <div class="text-right">{{ $t('sgt.pnl') }}</div>
    <div class="text-right">{{ $t('sgt.duration') }}</div>
    <div class="text-center">{{ $t('sgt.orderDetails') }}</div>
  </div>
</template>
