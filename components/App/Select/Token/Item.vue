<script lang="ts" setup>
import { PropType } from 'vue'
import type { Token } from '@injectivelabs/token-metadata'

const props = defineProps({
  sm: Boolean,
  xl: Boolean,
  showBalance: Boolean,

  token: {
    type: Object as PropType<Token>,
    required: true
  },

  balance: {
    type: String,
    default: ''
  }
})

const emit = defineEmits<{
  (e: 'click', state: string): void
}>()

const classes = computed(() => {
  if (props.sm) {
    return 'text-sm'
  }

  if (props.xl) {
    return 'text-xl'
  }

  return 'text-base'
})

const { valueToString: balanceToString } = useBigNumberFormatter(
  computed(() => props.balance)
)

function handleClick() {
  emit('click', props.token.denom)
}
</script>

<template>
  <div class="flex items-center justify-between" @click="handleClick">
    <div class="flex items-center gap-2">
      <CommonTokenIcon :token="token" />
      <span class="font-semibold max-w-2xs truncate" :class="classes">
        {{ token.symbol }}
      </span>
    </div>

    <div v-if="showBalance">{{ balanceToString }}</div>
  </div>
</template>
