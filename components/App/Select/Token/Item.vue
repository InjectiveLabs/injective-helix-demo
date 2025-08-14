<script lang="ts" setup>
import type { TokenStatic } from '@injectivelabs/sdk-ts'

const props = withDefaults(
  defineProps<{
    isSm?: boolean
    isXl?: boolean
    balance?: string
    token: TokenStatic
    isLoading?: boolean
    isLgTokenIcon?: boolean
    isShowTokenName?: boolean
    isBalanceVisible?: boolean
  }>(),
  {
    balance: ''
  }
)

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

        <span v-if="isShowTokenName" class="text-coolGray-450">
          {{ token.name }}
        </span>
      </div>
    </div>
    <AppSpinner v-if="isLoading" class="relative" is-sm />
    <div v-else-if="isBalanceVisible">
      <SharedAmount
        v-bind="{
          amount: balance
        }"
      />
    </div>
  </div>
</template>
