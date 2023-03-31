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
          <CommonTextTooltip :tooltip="$t('trade.timestamp_tooltip')">
            {{ $t('trade.time') }}
          </CommonTextTooltip>
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
          <CommonTextTooltip :tooltip="$t('trade.amount_tooltip')">
            {{ $t('trade.amount') }}
          </CommonTextTooltip>
        </div>
      </th>
      <th>
        <div class="flex items-center justify-end">
          <CommonTextTooltip :tooltip="$t('trade.fees_tooltip')">
            {{ $t('trade.fee') }}
          </CommonTextTooltip>
        </div>
      </th>
      <th class="h-8 pr-3">
        <div class="flex items-center justify-end">
          <CommonTextTooltip :tooltip="totalTooltip">
            {{ $t('trade.total') }}
          </CommonTextTooltip>
        </div>
      </th>
    </tr>
  </thead>
</template>
