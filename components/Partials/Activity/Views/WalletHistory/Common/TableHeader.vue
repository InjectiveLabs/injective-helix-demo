<template>
  <thead>
    <tr class="h-8">
      <th class="text-left pl-3">
        <div class="flex items-center">
          <CommonTextTooltip :tooltip="$t('trade.timestamp_tooltip')">
            {{ $t('trade.time') }}
          </CommonTextTooltip>
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
          <CommonTextTooltip
            :tooltip="$t('walletHistory.transfers.amountTooltip')"
          >
            {{ $t('walletHistory.transfers.amount') }}
          </CommonTextTooltip>
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
