<script lang="ts" setup>
import type { Token } from '@injectivelabs/token-metadata'

const props = defineProps({
  sm: Boolean,
  xl: Boolean,
  showBalance: Boolean,
  showTokenName: Boolean,
  lgTokenIcon: Boolean,

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
  click: [state: string]
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
      <CommonTokenIcon v-bind="{ token: token, lg: lgTokenIcon }" />

      <div class="flex flex-col max-w-2xs truncate" :class="classes">
        <span :class="sm ? 'font-medium text-xs' : 'font-semibold text-xl'">
          {{ token.symbol }}
        </span>

        <span v-if="showTokenName" class="text-gray-450">
          {{ token.name }}
        </span>
      </div>
    </div>

    <div v-if="showBalance">{{ balanceToString }}</div>
  </div>
</template>
