<script setup lang="ts">
const tokenStore = useTokenStore()

const token = computed(() =>
  tokenStore.tokens.find((token) => token.symbol === 'INJ')
)
</script>

<template>
  <div class="flex p-2">
    <div v-if="token" class="flex-1 flex items-center space-x-2 p-2">
      <CommonTokenIcon v-bind="{ token }" />
      <p>{{ token.symbol }}</p>
    </div>

    <div class="flex-1 flex items-center font-mono text-xs">
      <span class="text-green-500">Long</span>
    </div>

    <div class="flex-1 flex items-center font-mono text-xs">
      <div class="space-y-1">
        <p>2,3232.33 {{ token?.symbol }}</p>
        <p class="text-gray-500">$ 94,333.00</p>
      </div>
    </div>

    <div class="flex-1 flex items-center font-mono text-xs">200.0</div>

    <div class="flex-1 flex items-center font-mono text-xs">
      <div class="space-y-1 text-red-500">
        <p>$ 2,3232.33</p>
        <p>30.44%</p>
      </div>
    </div>

    <div class="flex-1 flex items-center font-mono text-xs">
      <div class="space-y-1">
        <p>2,3232.33 {{ token?.symbol }}</p>
        <p class="text-gray-500">$ 94,333.00</p>
      </div>
    </div>

    <div class="flex-1 flex items-center font-mono text-xs">200.0</div>
    <div class="flex-1 flex items-center font-mono text-xs">20x</div>
    <div class="flex-1 flex items-center font-mono text-xs">
      <AppButton size="sm" variant="danger-ghost"> Close </AppButton>
    </div>
  </div>
</template>
