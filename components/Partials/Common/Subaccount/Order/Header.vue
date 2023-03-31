<script lang="ts" setup>
const route = useRoute()

const isBinaryOptionsPage = route.name === 'binary-options-binaryOption'
</script>

<template>
  <thead>
    <tr>
      <th class="h-8 text-left pl-3">
        {{ $t('trade.pair') }}
      </th>
      <th class="h-8 text-left">
        <span>{{ $t('trade.side') }}</span>
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
      <th class="h-8 text-right">
        {{ $t('trade.unfilled') }}
      </th>
      <th class="h-8 text-right">
        {{ $t('trade.filled') }}
      </th>
      <th v-if="!isBinaryOptionsPage" class="text-right">
        {{ $t('trade.leverage') }}
      </th>
      <th class="h-8 text-right">
        {{ $t('trade.total') }}
      </th>
      <th></th>
    </tr>
  </thead>
</template>
