<script setup lang="ts">
import { NuxtUiIcons } from '@shared/types'
import { injToken } from '@shared/data/token'
import { ZERO_IN_BASE } from '@shared/utils/constant'
import { BigNumberInBase } from '@injectivelabs/utils'
import { TokenVerification } from '@injectivelabs/sdk-ts'
import {
  PortfolioCyTags,
  BalanceTableColumn,
  TransformedBalances
} from '@/types'

const breakpoints = useSharedBreakpoints()
const { t } = useLang()
const { lg } = useSharedBreakpoints()
const {
  stakedAmount,
  stakedAmountInUsd,
  activeSubaccountBalancesWithToken,
  activeSubaccountTradableBalancesWithToken
} = useBalance()

const props = withDefaults(
  defineProps<{
    search?: string
    tableHeaderClass?: string
    showUnverifiedAssets?: boolean
  }>(),
  {
    search: '',
    tableHeaderClass: ''
  }
)

const { rows } = useBalanceTransformer(
  computed(() =>
    props.showUnverifiedAssets
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

const sortedRows = computed(() => {
  return rows.value.sort((balance1, balance2) => {
    if (balance1.token.denom === injToken.denom) {
      return -1
    }

    if (balance2.token.denom === injToken.denom) {
      return 1
    }

    const balance1IsVerified =
      balance1.token.tokenVerification === TokenVerification.Verified
    const balance2IsVerified =
      balance2.token.tokenVerification === TokenVerification.Verified

    if (balance1IsVerified && balance2IsVerified) {
      return balance2[BalanceTableColumn.TotalUsd]
        .minus(balance1[BalanceTableColumn.TotalUsd])
        .toNumber()
    }

    if (balance1IsVerified) {
      return -1
    }

    if (balance2IsVerified) {
      return 1
    }

    return balance2[BalanceTableColumn.Total]
      .minus(balance1[BalanceTableColumn.Total])
      .toNumber()
  })
})

const rowsData = computed(() => {
  const data = [...sortedRows.value]

  if (showStakingRow.value) {
    return [
      ...data.slice(0, 1),
      {
        token: injToken,
        isStakingRow: true,
        [BalanceTableColumn.Available]: ZERO_IN_BASE,
        [BalanceTableColumn.UsedOrReserved]: stakedAmount.value,
        [BalanceTableColumn.UnrealizedPnl]: ZERO_IN_BASE,
        [BalanceTableColumn.Total]: ZERO_IN_BASE,
        [BalanceTableColumn.TotalUsd]: stakedAmountInUsd.value
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

    const isZeroBalance =
      new BigNumberInBase(balance[BalanceTableColumn.Total]).isZero() &&
      !balance.isStakingRow

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
                class="font-medium text-sm mb-1 leading-none max-w-52 truncate"
                :data-cy="`${dataCyTag(PortfolioCyTags.BalanceTokenSymbol)}`"
              >
                {{ row.token.symbol }}
              </p>
              <p class="text-xs text-coolGray-500 truncate max-w-52">
                {{ row.token.name }}
              </p>
            </div>

            <SharedIcon
              v-if="row.isVerified"
              name="check-shield"
              is-md
              class="text-green-500 ml-2"
            />

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
        <PartialsCommonBalanceDisplay
          v-if="!row.isStakingRow"
          v-bind="{
            token: row.token,
            isAlignRight: true,
            value: row[BalanceTableColumn.Available].toFixed()
          }"
        >
          <AppBalanceAmount
            class="text-white"
            v-bind="{ amount: row[BalanceTableColumn.Available].toFixed() }"
            :data-cy="dataCyTag(PortfolioCyTags.BalanceAvailableAmount)"
          />
        </PartialsCommonBalanceDisplay>
        <span v-else />
      </template>

      <template #used-or-reserved-data="{ row }">
        <span v-if="row.isStakingRow" class="mr-1 text-coolGray-400">
          {{ $t('trade.staked') }}:
        </span>

        <AppBalanceAmount
          v-bind="{
            showZeroAsEmDash: true,
            amount: row[BalanceTableColumn.UsedOrReserved].toFixed()
          }"
          :data-cy="dataCyTag(PortfolioCyTags.BalanceInUseOrReservedAmount)"
        />
      </template>

      <template #unrealized-pnl-data="{ row }">
        <AppBalanceAmount
          v-if="!row.isStakingRow"
          v-bind="{
            showZeroAsEmDash: true,
            amount: row[BalanceTableColumn.UnrealizedPnl].toFixed()
          }"
          :data-cy="dataCyTag(PortfolioCyTags.BalanceUnrealisedPnl)"
        />
        <span v-else />
      </template>

      <template #total-data="{ row }">
        <AppBalanceAmount
          v-if="!row.isStakingRow"
          v-bind="{
            amount: row[BalanceTableColumn.Total].toFixed()
          }"
          :data-cy="dataCyTag(PortfolioCyTags.BalanceTotalAmount)"
        />
        <span v-else />
      </template>

      <template #total-usd-data="{ row }">
        <div :class="{ 'text-coolGray-400': row.isStakingRow }">
          <span v-if="!row.isVerified">&mdash;</span>
          <template v-else>
            <span>$</span>
            <AppUsdBalanceAmount
              v-bind="{
                amount: row[BalanceTableColumn.TotalUsd].toFixed()
              }"
              :data-cy="dataCyTag(PortfolioCyTags.BalanceTotalValue)"
            />
          </template>
        </div>
      </template>

      <template #action-data="{ row }">
        <div class="flex justify-center">
          <PartialsPortfolioBalancesSubaccountTableActionBtns
            v-if="!row.isStakingRow"
            v-bind="{
              token: row.token,
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
