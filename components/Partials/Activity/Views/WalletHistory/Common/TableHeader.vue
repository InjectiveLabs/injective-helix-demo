<template>
  <thead>
    <tr class="h-8">
      <th class="text-left pl-3">
        <div class="flex items-center">
          {{ $t('trade.time') }}
          <CommonInfoTooltip
            class="ml-2"
            :tooltip="$t('trade.timestamp_tooltip')"
          />
        </div>
      </th>

      <th class="text-left">
        {{ $t('walletHistory.transfers.type') }}
      </th>

      <th class="text-left">
        {{ $t('walletHistory.transfers.asset') }}
      </th>

      <th>
        <div class="flex items-center justify-end">
          <span>{{ $t('walletHistory.transfers.amount') }}</span>
          <CommonInfoTooltip
            class="ml-2"
            :tooltip="$t('walletHistory.transfers.amountTooltip')"
          />
        </div>
      </th>

      <th class="text-left">
        {{ $t('walletHistory.transfers.origin') }}
      </th>

      <th class="text-left">
        {{ $t('walletHistory.transfers.destination') }}
      </th>

      <th></th>
    </tr>
  </thead>
</template>
