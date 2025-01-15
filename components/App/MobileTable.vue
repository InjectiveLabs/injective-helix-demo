<script setup lang="ts">
import { UTableColumn } from '@/types'

const { sm } = useSharedBreakpoints()

const props = withDefaults(
  defineProps<{
    gridClass?: string
    extraClass?: string
    columns: UTableColumn[]
    isAlwaysThreeColumn?: boolean
  }>(),
  {
    extraClass: '',
    gridClass: 'grid gap-6 grid-cols-2 sm:grid-cols-3'
  }
)

const hasOnlyTwoColumn = computed(() => props.columns.length === 2)

function alignmentClass(index: number) {
  const modulusCount = sm.value || props.isAlwaysThreeColumn ? 3 : 2
  const colIndex = index % modulusCount
  let baseClass = ''

  if (
    (!sm.value || hasOnlyTwoColumn.value) &&
    colIndex === 1 &&
    !props.isAlwaysThreeColumn
  ) {
    baseClass = 'items-end'
  } else if (colIndex === 1) {
    baseClass = 'items-center'
  } else if (colIndex === 2) {
    baseClass = 'items-end'
  }

  return baseClass
}
</script>

<template>
  <div :class="[extraClass || 'py-6 px-4']">
    <slot name="header" />

    <div class="text-xs" :class="gridClass">
      <div
        v-for="(column, index) in columns"
        :key="column.key"
        :class="[
          'flex flex-col gap-1 text-white',
          column.class,
          alignmentClass(index)
        ]"
      >
        <slot :name="`${column.key}-header`" :column="column">
          <p class="text-coolGray-450">
            {{ column.label }}
          </p>
        </slot>

        <slot :name="`${column.key}-data`" />
      </div>
    </div>
  </div>
</template>
