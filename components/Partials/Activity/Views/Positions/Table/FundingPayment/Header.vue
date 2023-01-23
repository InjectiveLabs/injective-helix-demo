<template>
  <thead>
    <tr class="h-8">
      <th class="text-left w-1/5 pl-3">
        <div class="flex items-center">
          {{ $t('trade.time') }}
          <AppInfoTooltip
            class="ml-2"
            :tooltip="$t('trade.timestamp_tooltip')"
          />
        </div>
      </th>

      <th class="text-left w-3/5">
        {{ $t('trade.pair') }}
      </th>

      <th class="w-1/5 pr-3">
        <div class="flex items-center justify-end">
          <span>{{ $t('fundingPayments.payment') }}</span>
          <AppInfoTooltip
            class="ml-2"
            :tooltip="$t('fundingPayments.paymentTooltip')"
          />
        </div>
      </th>
    </tr>
  </thead>
</template>
