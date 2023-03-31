<template>
  <thead>
    <tr class="h-8">
      <th class="text-left w-1/5 pl-3">
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

      <th class="text-left w-3/5">
        {{ $t('trade.pair') }}
      </th>

      <th class="w-1/5 pr-3">
        <div class="flex items-center justify-end">
          <CommonHeaderTooltip
            v-bind="{
              tooltip: $t('fundingPayments.paymentTooltip')
            }"
          >
            {{ $t('fundingPayments.payment') }}
          </CommonHeaderTooltip>
        </div>
      </th>
    </tr>
  </thead>
</template>
