<template>
  <div class="flex p-2 table-label">
    <div class="flex-1 min-w-0 p-2 truncate">{{ $t('sgt.time') }}</div>
    <div class="flex-1 min-w-0 p-2 truncate text-left">
      {{ $t('sgt.market') }}
    </div>
    <div class="flex-1 min-w-0 p-2 truncate text-right">
      {{ $t('sgt.lowerBound') }}
    </div>
    <div class="flex-1 min-w-0 p-2 truncate text-right">
      {{ $t('sgt.upperBound') }}
    </div>
    <div class="flex-1 min-w-0 p-2 truncate text-right">
      {{ $t('sgt.totalAmount') }}
    </div>
    <div class="flex-1 min-w-0 p-2 truncate text-right">
      {{ $t('sgt.totalProfit') }}
    </div>
    <div class="flex-1 min-w-0 p-2 truncate text-right">
      {{ $t('sgt.duration') }}
    </div>
    <div class="flex-1 min-w-0 p-2 truncate text-right">
      {{ $t('sgt.orderDetails') }}
    </div>
    <div class="flex-1 min-w-0 p-2 truncate text-right">
      {{ $t('sgt.stopReason') }}
    </div>
  </div>
</template>
