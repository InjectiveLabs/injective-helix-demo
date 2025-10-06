<script lang="ts" setup>
import { computed, PropType } from 'vue'

const props = defineProps({
  isDisabled: Boolean,

  extraLimitOptions: {
    type: Array as PropType<number[]>,
    default: () => []
  },

  limit: {
    type: Number,
    required: true
  },

  page: {
    type: Number,
    required: true
  },

  totalCount: {
    type: Number,
    required: true
  }
})

const emit = defineEmits<{
  'page:changed': [page: number]
  'limit:changed': [limit: number]
  'update:page': [page: number]
  'update:limit': [limit: number]
}>()

const limitOptions = [10, 20, 30, 40, 50]

const rowOptions = computed(() =>
  [...limitOptions, ...props.extraLimitOptions].sort((a, b) => a - b)
)

const totalPages = computed(() => Math.ceil(props.totalCount / props.limit))
const hasPrevPage = computed(() => props.page > 1)
const hasNextPage = computed(() => props.page !== totalPages.value)
const from = computed(() => props.page * props.limit - props.limit + 1)

const to = computed(() => {
  const maxCountOnPage = props.limit * props.page

  return maxCountOnPage > props.totalCount ? props.totalCount : maxCountOnPage
})

const pagesToDisplay = computed(() => {
  const middlePagesToDisplay = [] as Array<string | number>

  if (totalPages.value <= 7) {
    return [...Array(totalPages.value + 1).keys()].splice(1)
  }

  if (props.page < 4) {
    middlePagesToDisplay.push(2, 3, 4, 5, '...')
  } else if (totalPages.value - 3 <= props.page) {
    middlePagesToDisplay.push(
      '...',
      totalPages.value - 4,
      totalPages.value - 3,
      totalPages.value - 2,
      totalPages.value - 1
    )
  } else {
    middlePagesToDisplay.push(
      '...',
      props.page - 1,
      props.page,
      props.page + 1,
      '...'
    )
  }

  return [1, ...middlePagesToDisplay, totalPages.value]
})

function onClickEvent(page: number | string) {
  if (props.isDisabled || isNaN(Number(page)) || page === props.page) {
    return
  }

  emit('page:changed', Number(page))
  emit('update:page', Number(page))
}

function onNextEvent() {
  if (props.isDisabled || !hasNextPage.value) {
    return
  }

  emit('page:changed', props.page + 1)
  emit('update:page', props.page + 1)
}

function onPrevEvent() {
  if (props.isDisabled || !hasPrevPage.value) {
    return
  }

  emit('page:changed', props.page - 1)
  emit('update:page', props.page - 1)
}

function onUpdateLimit(limit: number) {
  if (limit === props.limit) {
    return
  }

  emit('limit:changed', limit)
  emit('update:limit', limit)
}
</script>

<template>
  <div>
    <slot name="summary" :from="from" :to="to">
      <div />
    </slot>
    <slot
      :has-prev-page="hasPrevPage"
      :has-next-page="hasNextPage"
      :on-click-event="onClickEvent"
      :on-next-event="onNextEvent"
      :on-prev-event="onPrevEvent"
      :pages-to-display="pagesToDisplay"
      :total-pages="totalPages"
    />

    <slot
      name="row-select"
      :row-options="rowOptions"
      :on-update-limit="onUpdateLimit"
    >
      <div />
    </slot>
  </div>
</template>
