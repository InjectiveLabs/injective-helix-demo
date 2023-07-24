<template>
  <thead>
    <tr>
      <th class="h-8 text-left pl-3">
        <div class="flex items-center">
          <CommonHeaderTooltip
            v-bind="{
              tooltip: $t('trade.timestamp_tooltip')
            }"
          >
            {{ $t('trade.time') }}
          </CommonHeaderTooltip>
        </div>
      </th>

      <th class="h-8 text-left">
        {{ $t('trade.swap.outgoing') }}
      </th>

      <th class="h-8 text-left">
        {{ $t('trade.swap.incoming') }}
      </th>

      <th class="h-8 text-left">
        {{ $t('trade.swap.route') }}
      </th>

      <th class="h-8 text-left">
        {{ $t('trade.swap.fee') }}
      </th>

      <th />
    </tr>
  </thead>
</template>
