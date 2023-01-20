<script lang="ts" setup>
import { PropType } from 'vue'
import { Token } from '@injectivelabs/token-metadata'

const props = defineProps({
  sm: Boolean,
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
      <span
        class="font-semibold max-w-2xs truncate"
        :class="[sm ? 'text-sm' : 'text-base']"
      >
        {{ token.symbol }}
      </span>
    </div>

    <div v-if="showBalance">{{ balanceToString }}</div>
  </div>
</template>
