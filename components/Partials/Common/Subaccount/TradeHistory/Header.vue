<script lang="ts" setup>
const route = useRoute()
const { t } = useLang()

const isSpot = route.name === 'spot-spot'

const totalTooltip = computed(() =>
  isSpot ? t('trade.spotTradeHistoryTotalTooltip') : t('trade.total_tooltip')
)
</script>

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
        {{ $t('trade.pair') }}
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
      <th>
        <div class="flex items-center justify-end">
          <CommonHeaderTooltip
            v-bind="{
              tooltip: $t('trade.fees_tooltip')
            }"
          >
            {{ $t('trade.fee') }}
          </CommonHeaderTooltip>
        </div>
      </th>
      <th class="h-8 pr-3">
        <div class="flex items-center justify-end">
          <CommonHeaderTooltip
            v-bind="{
              tooltip: totalTooltip
            }"
          >
            {{ $t('trade.total') }}
          </CommonHeaderTooltip>
        </div>
      </th>
    </tr>
  </thead>
</template>
