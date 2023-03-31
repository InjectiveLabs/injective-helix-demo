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
          <CommonHeaderTooltip
            v-bind="{
              tooltip: $t('trade.amount_tooltip')
            }"
          >
            <span>{{ $t('trade.amount') }}</span>
          </CommonHeaderTooltip>
        </div>
      </th>
      <th class="h-8 text-right">
        <span>{{ $t('trade.entryMark') }}</span>
      </th>
      <th v-if="!isBinaryOptionsPage">
        <div class="flex items-center justify-end">
          <CommonHeaderTooltip
            v-bind="{
              tooltip: $t('trade.liquidation_price_tooltip')
            }"
          >
            {{ $t('trade.estLiqPrice') }}
          </CommonHeaderTooltip>
        </div>
      </th>
      <th>
        <div class="flex items-center justify-end">
          <CommonHeaderTooltip
            v-bind="{
              tooltip: $t('trade.unrealized_pnl_tooltip')
            }"
          >
            {{ $t('trade.unrealized_pnl') }}
          </CommonHeaderTooltip>
        </div>
      </th>
      <th>
        <div class="flex items-center justify-end">
          <CommonHeaderTooltip
            v-bind="{
              tooltip: $t('trade.total_tooltip')
            }"
          >
            {{ $t('trade.total') }}
          </CommonHeaderTooltip>
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
