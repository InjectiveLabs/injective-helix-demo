<script lang="ts" setup>
import { NuxtUiIcons } from '@shared/types'
import { BigNumberInBase } from '@injectivelabs/utils'
import { PointsPeriod } from '@/types'
import { UI_DEFAULT_MIN_DISPLAY_DECIMALS } from '~/app/utils/constants'

const { t } = useLang()
const pointsStore = usePointsStore()
const { rows } = usePointsTransformer(
  computed(() => paginatedPointsHistory.value)
)

const props = withDefaults(
  defineProps<{ modelValue: PointsPeriod; pointsPeriodList: PointsPeriod[] }>(),
  {}
)

const emit = defineEmits<{
  'update:modelValue': [value: PointsPeriod]
}>()

const columns = [
  {
    key: 'period',
    label: t('points.period'),
    class: 'w-[200px]'
  },
  {
    key: 'volume',
    label: t('points.volume'),
    class: 'text-right'
  },
  {
    key: 'points',
    label: t('points.points'),
    class: 'text-right'
  }
]

const limit = 7
const page = ref(1)

const filteredPointsHistory = computed(() =>
  pointsStore.pointsHistory.filter(
    ({ pointsPrecise }) => !new BigNumberInBase(pointsPrecise).isZero()
  )
)

const paginatedPointsHistory = computed(() => {
  let paginatedPoints = filteredPointsHistory.value.slice(
    (page.value - 1) * limit,
    page.value * limit
  )

  if (paginatedPoints.length <= 2) {
    const emptyData = {
      points: '',
      volume: 0,
      periodStart: '',
      periodEnd: ''
    }

    const emptyDataList: any = {
      0: [],
      1: [emptyData, emptyData],
      2: [emptyData]
    }

    paginatedPoints = paginatedPoints.concat(
      emptyDataList[paginatedPoints.length]
    )
  }

  return paginatedPoints
})

const paginationDetails = computed(() => {
  const to = limit * page.value
  const from = limit * (page.value - 1) + 1
  const total = filteredPointsHistory.value.length

  return {
    from,
    total,
    to: to > total ? total : to
  }
})

const selectedPeriod = computed({
  get: (): PointsPeriod => props.modelValue,
  set: (value: PointsPeriod) => {
    page.value = 1
    emit('update:modelValue', value)
  }
})

const isEmpty = computed(() => filteredPointsHistory.value.length === 0)
const isPrevDisabled = computed(() => new BigNumberInBase(page.value).eq(1))

const isNextDisabled = computed(() =>
  new BigNumberInBase(page.value)
    .times(limit)
    .gte(filteredPointsHistory.value.length)
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
    class="w-full flex-1 flex flex-col justify-between bg-[#1d2130] rounded-lg overflow-hidden"
  >
    <UTable
      :rows="rows"
      :columns="columns"
      :ui="{
        ...(isEmpty ? { wrapper: 'flex-grow' } : {}),
        base: 'h-full',
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
          padding: 'py-3 px-2',
          color: 'dark:text-white',
          base: 'bg-[#1d2130] leading-none'
        }
      }"
    >
      <template #period-header>
        <USelectMenu
          v-model="selectedPeriod"
          :options="pointsPeriodList"
          :popper="{ placement: 'bottom-start' }"
          :ui-menu="{
            width: 'w-28',
            background: 'dark:bg-brand-825',
            option: { base: 'capitalize' }
          }"
        >
          <template #default="{ open }">
            <span
              class="flex gap-2 items-center dark:text-coolGray-450 hover:dark:text-white transition font-medium text-sm capitalize"
            >
              {{ selectedPeriod }}
              <UIcon
                :name="NuxtUiIcons.ChevronUp2"
                class="size-3.5 transition-transform transform rotate-180"
                :class="[open && 'rotate-0']"
              />
            </span>
          </template>
        </USelectMenu>
      </template>

      <template #period-data="{ row }">
        <p v-show="row.period" class="leading-tight">
          {{ row.period.split(' - ')[1] }}
        </p>
      </template>

      <template #volume-data="{ row }">
        <span v-show="row.volume" class="flex justify-end font-mono">
          <AppAmount
            v-if="row.volumeInBigNumber.gte(1)"
            v-bind="{
              amount: row.volumeInBigNumber,
              decimalPlaces: row.volumeInBigNumber.gte(1_000_000)
                ? 0
                : UI_DEFAULT_MIN_DISPLAY_DECIMALS
            }"
          />
          <span v-else>{{ '< 1' }}</span>
        </span>
      </template>

      <template #points-data="{ row }">
        <span v-show="row.points" class="flex justify-end">
          <AppAmount
            v-if="row.pointsInBigNumber.gte(1)"
            v-bind="{
              amount: row.points,
              decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS
            }"
          />
          <span v-else>{{ '< 1' }}</span>
        </span>
      </template>
    </UTable>

    <div
      v-if="!isEmpty"
      class="flex items-center justify-end bg-[#1d2130] py-4 px-0.5"
    >
      <p class="text-sm text-white font-medium mr-2">
        {{
          t('points.paginationDetails', {
            from: paginationDetails.from,
            to: paginationDetails.to,
            total: paginationDetails.total
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
