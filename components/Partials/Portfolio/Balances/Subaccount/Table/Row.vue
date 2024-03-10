<script setup lang="ts">
const tokenStore = useTokenStore()

const token = computed(() =>
  tokenStore.tokens.find((token) => token.symbol === 'INJ')
)
</script>

<template>
  <div class="flex p-4">
    <div v-if="token" class="flex-[2] flex items-center space-x-2 shrink-0">
      <CommonTokenIcon v-bind="{ token }" />
      <p>{{ token.symbol }}</p>
    </div>

    <div class="shrink-0 flex-[2] flex items-center font-mono text-xs">
      200.0
    </div>
    <div class="shrink-0 flex-[2] flex items-center font-mono text-xs">
      200.0
    </div>
    <div class="shrink-0 flex-[2] flex items-center font-mono text-xs">
      200.0
    </div>

    <div class="flex-[2] flex items-center font-mono text-xs shrink-0">
      <div class="space-y-1">
        <p>2,3232.33 {{ token?.symbol }}</p>
        <p class="text-gray-500">$ 94,333.00</p>
      </div>
    </div>

    <div
      class="flex-[3] flex items-center font-mono text-xs space-x-2 shrink-0"
    >
      <AppButton
        variant="primary"
        class="bg-gray-500 hover:bg-gray-500/80 border-gray-500 hover:border-gray-500"
        size="sm"
      >
        Withdraw
      </AppButton>
      <AppButton
        variant="primary"
        class="bg-gray-500 hover:bg-gray-500/80 border-gray-500 hover:border-gray-500"
        size="sm"
      >
        Deposit
      </AppButton>
      <AppButton
        variant="primary"
        class="bg-gray-500 hover:bg-gray-500/80 border-gray-500 hover:border-gray-500"
        size="sm"
      >
        Transfer
      </AppButton>
    </div>
  </div>
</template>
