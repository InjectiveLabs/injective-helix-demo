<script lang="ts" setup>
import { PropType } from 'vue'
import { TabOption } from '@/types'

defineProps({
  tabs: {
    type: Array as PropType<TabOption[]>,
    required: true
  },

  value: {
    type: Object as PropType<TabOption>,
    required: true
  }
})

const emit = defineEmits<{
  (e: 'update:tab', state: TabOption): void
}>()

function handleClick(tab: TabOption) {
  emit('update:tab', tab)
}
</script>

<template>
  <AppTabMenu>
    <template #items>
      <NuxtLink
        v-for="tab in tabs"
        :key="tab.value"
        :to="{ name: 'account', query: { view: tab.url } }"
      >
        <AppTabMenuItem
          :value="tab.value"
          :active="value.value === tab.value"
          data-cy="account-tabs-balances-selector"
          @click="handleClick(tab)"
        >
          {{ $t(tab.label) }}
        </AppTabMenuItem>
      </NuxtLink>
    </template>
  </AppTabMenu>
</template>
