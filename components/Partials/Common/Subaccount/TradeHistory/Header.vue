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
          {{ $t('trade.time') }}
          <CommonInfoTooltip
            class="ml-2"
            :tooltip="$t('trade.timestamp_tooltip')"
          />
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
          <span>{{ $t('trade.amount') }}</span>
          <CommonInfoTooltip
            class="ml-2"
            :tooltip="$t('trade.amount_tooltip')"
          />
        </div>
      </th>
      <th>
        <div class="flex items-center justify-end">
          {{ $t('trade.fee') }}
          <CommonInfoTooltip class="ml-2" :tooltip="$t('trade.fees_tooltip')" />
        </div>
      </th>
      <th class="h-8 pr-3">
        <div class="flex items-center justify-end">
          <span>{{ $t('trade.total') }}</span>
          <CommonInfoTooltip class="ml-2" :tooltip="totalTooltip" />
        </div>
      </th>
    </tr>
  </thead>
</template>
