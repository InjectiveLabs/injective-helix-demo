<script lang="ts" setup>
import { TokenStatic } from '@injectivelabs/sdk-ts'

const props = defineProps({
  isSm: Boolean,
  isXl: Boolean,
  isLoading: Boolean,
  isLgTokenIcon: Boolean,
  isShowTokenName: Boolean,
  isBalanceVisible: Boolean,

  token: {
    type: Object as PropType<TokenStatic>,
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
  if (props.isSm) {
    return 'text-sm'
  }

  if (props.isXl) {
    return 'text-xl'
  }

  return 'text-base'
})

const { valueToString: balanceToString } = useSharedBigNumberFormatter(
  computed(() => props.balance)
)

function click() {
  emit('click', props.token.denom)
}
</script>

<template>
  <div class="flex items-center justify-between" @click="click">
    <div class="flex items-center gap-2">
      <CommonTokenIcon v-bind="{ token: token, isLg: isLgTokenIcon }" />

      <div class="flex flex-col max-w-2xs truncate" :class="classes">
        <span :class="isSm ? 'font-medium text-xs' : 'font-semibold text-xl'">
          {{ token.symbol }}
        </span>

        <span v-if="isShowTokenName" class="text-gray-450">
          {{ token.name }}
        </span>
      </div>
    </div>
    <AppSpinner v-if="isLoading" class="relative" is-sm />
    <div v-else-if="isBalanceVisible">{{ balanceToString }}</div>
  </div>
</template>
