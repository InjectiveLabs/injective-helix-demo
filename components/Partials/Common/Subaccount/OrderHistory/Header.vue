<template>
  <thead>
    <tr>
      <th class="h-8 text-left pl-3">
        <div class="flex items-center justify-start">
          <span>{{ $t('trade.time') }}</span>
          <AppInfoTooltip
            class="ml-2"
            :tooltip="$t('trade.timeTooltip', { type: 'order' })"
          />
        </div>
      </th>
      <th class="h-8 text-left">
        {{ $t('trade.market') }}
      </th>
      <th class="h-8 text-left">
        {{ $t('trade.type') }}
      </th>
      <th class="h-8 text-left">
        {{ $t('trade.side') }}
      </th>
      <th class="h-8 text-right">
        {{ $t('trade.price') }}
      </th>
      <th>
        <div class="flex items-center justify-end">
          <span>{{ $t('trade.amount') }}</span>
          <AppInfoTooltip class="ml-2" :tooltip="$t('trade.amount_tooltip')" />
        </div>
      </th>
      <th class="h-8 text-right">
        {{ $t('trade.total') }}
      </th>
      <th class="h-8 text-right">
        {{ $t('trade.triggerCondition') }}
      </th>
      <th class="h-8 text-right pr-3">
        {{ $t('trade.status') }}
      </th>
    </tr>
  </thead>
</template>
