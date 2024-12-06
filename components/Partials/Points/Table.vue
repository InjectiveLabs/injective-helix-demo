<script lang="ts" setup>
import { NuxtUiIcons } from '@shared/types'

const { t } = useLang()

const columns = [
  {
    key: 'week',
    label: t('points.week'),
    sortable: true,
    class: 'w-[2]'
  },
  {
    key: 'volume',
    label: t('points.volume'),
    class: 'text-center'
  },
  {
    key: 'points',
    label: t('points.points'),
    class: 'text-right'
  }
]

const pageCount = 7
const page = ref(1)

const pointsData = computed(() => {
  const mockData = []
  const baseObject = {
    week: 'Dec 21, 2024 - Dec 28, 2024',
    points: '888,888',
    volume: '100,873.02'
  }

  for (let index = 0; index < 25; index++) {
    mockData.push({
      ...baseObject,
      points: `${index + 1},${baseObject.points}`
    })
  }

  return mockData
})

const rows = computed(() => {
  return pointsData.value.slice(
    (page.value - 1) * pageCount,
    page.value * pageCount
  )
})

const getPaginationDetails = computed(() => {
  const from = 1 + pageCount * (page.value - 1)
  const to = pageCount * page.value
  const totalData = pointsData.value.length
  const maxPage = Math.ceil(totalData / pageCount)

  return {
    from,
    maxPage,
    totalData,
    to: to > totalData ? totalData : to
  }
})

const isPaginationDisabled = computed(() => ({
  prev: page.value === 1,
  next: page.value === getPaginationDetails.value.maxPage
}))

function paginate(type: string) {
  if (type === 'prev' && page.value > 1) {
    page.value--
  }

  if (type === 'next' && page.value < getPaginationDetails.value.maxPage) {
    page.value++
  }
}
</script>

<template>
  <div
    class="w-full flex-1 flex flex-col justify-between bg-[#262A30] rounded-lg overflow-hidden"
  >
    <UTable
      :rows="rows"
      :columns="columns"
      :ui="{
        divide: 'dark:divide-y-0',
        tbody: 'dark:divide-y-0',
        th: {
          padding: 'py-3 px-2',
          size: 'text-sm',
          font: 'font-medium',
          color: 'dark:text-coolGray-450',
          base: 'dark:bg-brand-825 [&>button]:text-sm [&>button]:dark:text-coolGray-450'
        },
        td: {
          size: 'text-sm',
          font: 'font-medium',
          base: 'bg-[#262A30] leading-none',
          padding: 'py-3 px-2',
          color: 'dark:text-white'
        }
      }"
    >
      <template #week-data="{ row }">
        <p>{{ row.week }}</p>
      </template>

      <template #volume-data="{ row }">
        <p class="text-center font-mono">${{ row.volume }}</p>
      </template>

      <template #points-data="{ row }">
        <p class="text-end">{{ row.points }}</p>
      </template>
    </UTable>

    <div class="flex items-center justify-end bg-[#262A30] py-4 px-0.5">
      <p class="text-sm text-white font-medium mr-2">
        {{ getPaginationDetails.from }}-{{ getPaginationDetails.to }} of
        {{ getPaginationDetails.totalData }}
      </p>
      <AppButton
        class="p-1.5 disabled:border-none focus-within:ring-0"
        variant="primary-ghost"
        :disabled="isPaginationDisabled.prev"
        @click="paginate('prev')"
      >
        <UIcon
          :name="NuxtUiIcons.ChevronLeft2"
          class="size-3"
          :class="{ 'pointer-events-none': isPaginationDisabled.prev }"
        />
      </AppButton>
      <AppButton
        class="p-1.5 disabled:border-none focus-within:ring-0"
        variant="primary-ghost"
        :disabled="isPaginationDisabled.next"
        @click="paginate('next')"
      >
        <UIcon
          :name="NuxtUiIcons.ChevronRight2"
          class="size-3"
          :class="{ 'pointer-events-none': isPaginationDisabled.next }"
        />
      </AppButton>
    </div>
  </div>
</template>
