<script lang="ts" setup>
const route = useRoute()

const isBinaryOptionsPage = route.name === 'binary-options-binaryOption'
</script>

<template>
  <thead>
    <tr>
      <th class="h-8 text-left pl-3">
        <span>{{ $t('trade.pair') }}</span>
      </th>
      <th>
        <div class="flex items-center">
          {{ $t('trade.side') }}
        </div>
      </th>
      <th>
        <div class="flex items-center justify-end">
          <span>{{ $t('trade.amount') }}</span>
          <CommonInfoTooltip
            class="ml-2"
            :tooltip="$t('trade.amount_tooltip')"
          />
        </div>
      </th>
      <th class="h-8 text-right">
        <span>{{ $t('trade.entryMark') }}</span>
      </th>
      <th v-if="!isBinaryOptionsPage">
        <div class="flex items-center justify-end">
          <span>{{ $t('trade.estLiqPrice') }}</span>
          <CommonInfoTooltip
            class="ml-2"
            :tooltip="$t('trade.liquidation_price_tooltip')"
          />
        </div>
      </th>
      <th>
        <div class="flex items-center justify-end">
          <span>{{ $t('trade.unrealized_pnl') }}</span>
          <CommonInfoTooltip
            class="ml-2"
            :tooltip="$t('trade.unrealized_pnl_tooltip')"
          />
        </div>
      </th>
      <th>
        <div class="flex items-center justify-end">
          <span>{{ $t('trade.total') }}</span>
          <CommonInfoTooltip
            class="ml-2"
            :tooltip="$t('trade.total_tooltip')"
          />
        </div>
      </th>
      <th class="h-8 text-right">
        <span>{{ $t('trade.margin') }}</span>
      </th>
      <th v-if="!isBinaryOptionsPage" class="text-right">
        <span>{{ $t('trade.leverage') }}</span>
      </th>
      <th></th>
    </tr>
  </thead>
</template>
