<script lang="ts" setup>
const route = useRoute()

defineProps({
  isAccount: Boolean
})

const isBinaryOptionsPage = route.name === 'binary-options-binaryOption'
</script>

<template>
  <thead
    class="text-xs font-normal align-middle leading-tight bg-transparent border-none select-none whitespace-nowrap"
    :class="{ 'text-gray-350': isAccount }"
  >
    <tr class="text-xs">
      <th class="h-8 text-left pl-3" :class="{ 'pr-4': isAccount }">
        <span>{{ $t('trade.pair') }}</span>
      </th>
      <th>
        <div class="flex items-center">
          {{ $t('trade.side') }}
        </div>
      </th>
      <th :class="{ 'pr-4': isAccount }">
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
      <th class="h-8 text-right" :class="{ 'pr-4': isAccount }">
        <span>{{ $t('trade.entryMark') }}</span>
      </th>
      <th v-if="!isBinaryOptionsPage" :class="{ 'pr-4': isAccount }">
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
      <th :class="{ 'pr-4': isAccount }">
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
      <th :class="{ 'pr-6': isAccount }">
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
      <th class="h-8 text-right" :class="{ 'pr-4': isAccount }">
        <span>{{ $t('trade.margin') }}</span>
      </th>
      <th
        v-if="!isBinaryOptionsPage"
        class="text-right"
        :class="{ 'pr-4': isAccount }"
      >
        <span>{{ $t('trade.leverage') }}</span>
      </th>
      <th></th>
    </tr>
  </thead>
</template>
