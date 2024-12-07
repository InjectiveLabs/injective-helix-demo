<script lang="ts" setup>
import { NuxtUiIcons } from '@shared/types'
import { BigNumberInBase } from '@injectivelabs/utils'

const pointsStore = usePointsStore()
const { t } = useLang()

const columns = [
  {
    key: 'day',
    label: t('points.day'),
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

const limit = 10
const page = ref(1)

const { rows } = usePointsTransformer(
  computed(() => paginatedPointsHistory.value)
)

const paginatedPointsHistory = computed(() => {
  return pointsStore.pointsHistory.slice(
    (page.value - 1) * limit,
    page.value * limit
  )
})

const isPrevDisabled = computed(() => new BigNumberInBase(page.value).eq(1))

const isNextDisabled = computed(() =>
  new BigNumberInBase(page.value)
    .times(limit)
    .gte(pointsStore.pointsHistory.length)
)

function onPrevious() {
  page.value--
}

function onNext() {
  page.value++
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
          base: 'dark:bg-brand-825 [&>button]:text-sm'
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
      <template #day-data="{ row }">
        <p>{{ row.period }}</p>
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
        {{
          t('points.paginationDetails', {
            from: limit * (page - 1) + 1,
            to: pointsStore.pointsHistory.length
          })
        }}
      </p>
      <AppButton
        class="p-1.5 disabled:border-none focus-within:ring-0"
        variant="primary-ghost"
        :disabled="isPrevDisabled"
        @click="onPrevious"
      >
        <UIcon
          :name="NuxtUiIcons.ChevronLeft2"
          class="size-3"
          :class="{ 'pointer-events-none': isPrevDisabled }"
        />
      </AppButton>
      <AppButton
        class="p-1.5 disabled:border-none focus-within:ring-0"
        variant="primary-ghost"
        :disabled="isNextDisabled"
        @click="onNext"
      >
        <UIcon
          :name="NuxtUiIcons.ChevronRight2"
          class="size-3"
          :class="{ 'pointer-events-none': isNextDisabled }"
        />
      </AppButton>
    </div>
  </div>
</template>
