<script setup lang="ts">
import { NuxtUiIcons } from '@shared/types'
import { injToken } from '@shared/data/token'
import { BigNumberInBase } from '@injectivelabs/utils'
import { UI_DEFAULT_MIN_DISPLAY_DECIMALS } from '@/app/utils/constants'
import {
  PortfolioCyTags,
  BalanceTableColumn,
  TransformedBalances
} from '@/types'

const { t } = useLang()
const {
  stakedAmount,
  stakedAmountInUsd,
  showUnverifiedAssets,
  activeSubaccountBalancesWithToken,
  activeSubaccountTradableBalancesWithToken
} = useBalance()
const { lg } = useTwBreakpoints()
const breakpoints = useBreakpointsTw()

const props = withDefaults(
  defineProps<{
    search?: string
    tableHeaderClass?: string
  }>(),
  {
    search: '',
    tableHeaderClass: ''
  }
)

const { rows } = useBalanceTransformer(
  computed(() =>
    showUnverifiedAssets.value
      ? activeSubaccountBalancesWithToken.value
      : activeSubaccountTradableBalancesWithToken.value
  )
)

const fourXl = breakpoints['4xl']

const showStakingRow = ref(false)

const columns = computed(() => {
  const columnArray = [
    {
      key: BalanceTableColumn.Assets,
      label: t(`account.table.${BalanceTableColumn.Assets}`),
      class: 'w-[16%]'
    },
    {
      key: BalanceTableColumn.Available,
      label: t(`account.table.${BalanceTableColumn.Available}`),
      class: 'text-right w-[8%]'
    },
    {
      key: BalanceTableColumn.UsedOrReserved,
      label: t(`account.table.${BalanceTableColumn.UsedOrReserved}`),
      class: 'text-right'
    },
    {
      key: BalanceTableColumn.UnrealizedPnl,
      label: t(`account.table.${BalanceTableColumn.UnrealizedPnl}`),
      class: 'text-right'
    },
    {
      key: BalanceTableColumn.Total,
      label: t(`account.table.${BalanceTableColumn.Total}`),
      class: 'text-right'
    },
    {
      key: BalanceTableColumn.TotalUsd,
      label: t(`account.table.${BalanceTableColumn.TotalUsd}`),
      class: 'text-right w-[13%]'
    }
  ]

  if (!lg.value) {
    columnArray.push(
      {
        key: BalanceTableColumn.Staked,
        label: t(`account.table.${BalanceTableColumn.Staked}`),
        class: ''
      },
      {
        key: BalanceTableColumn.StakedUsd,
        label: t(`account.table.${BalanceTableColumn.StakedUsd}`),
        class: ''
      }
    )
  }

  if (fourXl.value) {
    columnArray.push({
      key: BalanceTableColumn.Action,
      label: '',
      class: ''
    })
  }

  return columnArray
})

const rowsData = computed(() => {
  const data = [...rows.value]

  if (showStakingRow.value) {
    return [
      ...data.slice(0, 1),
      {
        token: injToken,
        isStakingRow: true,
        [BalanceTableColumn.Available]: '',
        [BalanceTableColumn.UsedOrReserved]: stakedAmount.value.toFixed(
          UI_DEFAULT_MIN_DISPLAY_DECIMALS
        ),
        [BalanceTableColumn.UnrealizedPnl]: '',
        [BalanceTableColumn.Total]: '',
        [BalanceTableColumn.TotalUsd]: stakedAmountInUsd.value.toFixed(
          UI_DEFAULT_MIN_DISPLAY_DECIMALS
        )
      } as TransformedBalances,
      ...data.slice(1)
    ]
  }

  return data
})

const filteredRows = computed(() =>
  rowsData.value.filter((balance) => {
    const search = props.search.toLowerCase()
    const isIncludedInSymbol = balance.token.symbol
      .toLowerCase()
      .includes(search)

    const isIncludedInName = balance.token.name.toLowerCase().includes(search)
    const isPartOfSearch = !search || isIncludedInSymbol || isIncludedInName

    const isZeroBalance = new BigNumberInBase(
      balance[BalanceTableColumn.Total]
    ).isZero()

    return !isZeroBalance && isPartOfSearch
  })
)

function toggleStakingRow() {
  showStakingRow.value = !showStakingRow.value
}
</script>

<template>
  <template v-if="lg">
    <UTable
      :rows="filteredRows"
      :columns="columns"
      :ui="{
        th: {
          color: `dark:text-coolGray-400 ${props.tableHeaderClass}`,
          base: 'leading-5'
        },
        td: { padding: 'p-4', base: 'text-right' }
      }"
    >
      <template #assets-data="{ row }">
        <div
          v-if="!row.isStakingRow"
          class="flex items-center"
          :class="[row.token.denom === injToken.denom ? 'gap-1' : 'gap-2']"
        >
          <div class="flex items-center gap-2 text-left">
            <UAvatar size="xs" :src="row.token.logo" />
            <div class="ml-2">
              <p
                class="font-medium text-sm mb-1 leading-none"
                :data-cy="`${dataCyTag(PortfolioCyTags.BalanceTokenSymbol)}`"
              >
                {{ row.token.symbol }}
              </p>
              <p class="text-xs text-coolGray-500">{{ row.token.name }}</p>
            </div>

            <AppButton
              v-if="row.token.denom === injToken.denom"
              variant="primary-ghost"
              size="xs"
              class="text-coolGray-400 hover:bg-transparent hover:text-white focus-within:ring-0"
              @click="toggleStakingRow"
            >
              <UIcon
                :name="
                  showStakingRow
                    ? NuxtUiIcons.ChevronUp
                    : NuxtUiIcons.ChevronDown
                "
                class="size-4"
              />
            </AppButton>
          </div>

          <AppTablePopover v-if="!row.hasNoActionButtons && !fourXl">
            <div class="rounded-lg p-2 bg-brand-800 min-w-28">
              <PartialsPortfolioBalancesSubaccountTableActionBtns
                v-if="!row.isStakingRow"
                is-table-popover
                v-bind="{
                  token: row.token,
                  isVerified: row.isVerified,
                  isBridgable: row.isBridgable
                }"
              />
            </div>
          </AppTablePopover>
        </div>
      </template>

      <template #available-data="{ row }">
        <AppAmount
          v-if="!row.isStakingRow"
          v-bind="{ amount: row[BalanceTableColumn.Available] }"
          :data-cy="dataCyTag(PortfolioCyTags.BalanceAvailableAmount)"
        />
      </template>

      <template #used-or-reserved-data="{ row }">
        <span v-if="row.isStakingRow" class="mr-1 text-coolGray-400">
          {{ $t('trade.staked') }}:
        </span>

        <AppAmount
          v-bind="{
            showZeroAsEmDash: true,
            amount: row[BalanceTableColumn.UsedOrReserved]
          }"
          :data-cy="dataCyTag(PortfolioCyTags.BalanceInUseOrReservedAmount)"
        />
      </template>

      <template #unrealized-pnl-data="{ row }">
        <AppAmount
          v-if="!row.isStakingRow"
          v-bind="{
            showZeroAsEmDash: true,
            amount: row[BalanceTableColumn.UnrealizedPnl]
          }"
          :data-cy="dataCyTag(PortfolioCyTags.BalanceUnrealisedPnl)"
        />
      </template>

      <template #total-data="{ row }">
        <AppAmount
          v-if="!row.isStakingRow"
          v-bind="{
            amount: row[BalanceTableColumn.Total]
          }"
          :data-cy="dataCyTag(PortfolioCyTags.BalanceTotalAmount)"
        />
      </template>

      <template #total-usd-data="{ row }">
        <div :class="{ 'text-coolGray-400': row.isStakingRow }">
          <span>$ </span>
          <AppAmount
            v-bind="{
              amount: row[BalanceTableColumn.TotalUsd]
            }"
            :data-cy="dataCyTag(PortfolioCyTags.BalanceTotalValue)"
          />
        </div>
      </template>

      <template #action-data="{ row }">
        <div class="flex justify-center">
          <PartialsPortfolioBalancesSubaccountTableActionBtns
            v-if="!row.isStakingRow"
            v-bind="{
              token: row.token,
              isVerified: row.isVerified,
              isBridgable: row.isBridgable
            }"
          />
        </div>
      </template>
    </UTable>
  </template>

  <template v-else>
    <PartialsPortfolioBalancesSubaccountMobileTable
      v-for="balance in filteredRows"
      :key="balance.token.denom"
      v-bind="{ balance, columns, stakedAmount, stakedAmountInUsd }"
    />
  </template>
</template>
