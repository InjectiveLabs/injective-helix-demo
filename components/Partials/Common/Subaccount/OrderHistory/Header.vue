<template>
  <thead>
    <tr>
      <th class="h-8 text-left pl-3">
        <div class="flex items-center justify-start">
          <CommonHeaderTooltip
            v-bind="{
              tooltip: $t('trade.timeTooltip', { type: 'order' })
            }"
          >
            {{ $t('trade.time') }}
          </CommonHeaderTooltip>
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
          <CommonHeaderTooltip
            v-bind="{
              tooltip: $t('trade.amount_tooltip')
            }"
          >
            {{ $t('trade.amount') }}
          </CommonHeaderTooltip>
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
