<script setup lang="ts">
const number = ref(41412)

useIntervalFn(() => {
  number.value = Math.random() * 50000 + 200000
}, 2000)
</script>

<template>
  <div class="flex justify-between">
    <div class="space-y-2">
      <p class="text-gray-400 text-sm">
        {{ $t('portfolio.balances.netWorth') }}
      </p>
      <div class="flex items-center space-x-4">
        <p class="text-2xl font-semibold flex items-center space-x-2">
          <span>$</span>
          <CommonNumberCounter v-bind="{ value: number }" />
        </p>
        <button class="text-gray-500">
          <BaseIcon name="hide" />
        </button>
      </div>
      <p class="text-gray-400 text-sm">≈ 0.2407 BTC</p>
    </div>

    <div class="flex items-center space-x-2">
      <AppButton>{{ $t('common.deposit') }}</AppButton>

      <AppButton variant="primary-outline">
        {{ $t('common.withdraw') }}
      </AppButton>

      <AppButton variant="primary-outline">
        {{ $t('common.transfer') }}
      </AppButton>
    </div>
  </div>
</template>
