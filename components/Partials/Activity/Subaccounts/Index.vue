<script setup lang="ts">
import { ActivityTab } from '@/types'

const route = useRoute()

defineEmits<{
  (e: 'update:subaccount', subaccount: string): void
}>()

const showSelector = computed(
  () => (route.query.tab as string) !== ActivityTab.WalletHistory
)
</script>

<template>
  <div class="flex items-center py-4">
    <h1 class="text-3xl font-semibold mr-4 my-2">
      {{ $t('activity.activity') }}
    </h1>
    <PartialsActivitySubaccountsSelector
      v-if="showSelector"
      @update:subaccount="$emit('update:subaccount')"
    />
  </div>
</template>
