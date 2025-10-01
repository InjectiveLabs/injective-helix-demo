<script setup lang="ts">
import { NuxtUiIcons } from '@shared/types'
import { injToken } from '@shared/data/token'
import {
  ZERO_IN_BASE,
  DEFAULT_PERCENTAGE_DECIMALS
} from '@shared/utils/constant'
import { BigNumberInBase } from '@injectivelabs/utils'
import { TokenStatic, TokenVerification } from '@injectivelabs/sdk-ts'
import { PortfolioCyTags, BalanceTableColumn } from '@/types'
import type { TransformedBalances } from '@/types'

const accountStore = useAccountStore()
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

const emit = defineEmits<{
  'balance:share': [token: TokenStatic]
}>()

const { rows } = useBalanceTransformer(
  computed(() =>
    props.showUnverifiedAssets
      ? activeSubaccountBalancesWithToken.value
      : activeSubaccountTradableBalancesWithToken.value
  )
)

const fourXl = breakpoints['4xl']

const showStakingRow = ref(false)

const showPnlAndRoi = computed(() => !accountStore.hasMultipleSubaccounts)

const columns = computed(() => {
  const columnArray = [
    {
      key: BalanceTableColumn.Assets,
      label: t(`portfolio.table.balance.${BalanceTableColumn.Assets}`),
      class: 'w-[16%]'
    },
    {
      key: BalanceTableColumn.Available,
      label: t(`portfolio.table.balance.${BalanceTableColumn.Available}`),
      class: 'text-right w-[8%]'
    },
    {
      key: BalanceTableColumn.UsedOrReserved,
      label: t(`portfolio.table.balance.${BalanceTableColumn.UsedOrReserved}`),
      class: 'text-right'
    },
    {
      key: BalanceTableColumn.Pnl,
      label: t(`portfolio.table.balance.${BalanceTableColumn.Pnl}`),
      class: 'text-right'
    },
    {
      key: BalanceTableColumn.Total,
      label: t(`portfolio.table.balance.${BalanceTableColumn.Total}`),
      class: 'text-right'
    },
    {
      key: BalanceTableColumn.TotalUsd,
      label: t(`portfolio.table.balance.${BalanceTableColumn.TotalUsd}`),
      class: 'text-right w-[13%]'
    }
  ]

  if (!lg.value) {
    columnArray.push(
      {
        key: BalanceTableColumn.Staked,
        label: t(`portfolio.table.balance.${BalanceTableColumn.Staked}`),
        class: ''
      },
      {
        key: BalanceTableColumn.StakedUsd,
        label: t(`portfolio.table.balance.${BalanceTableColumn.StakedUsd}`),
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
  return [...rows.value].sort((balance1, balance2) => {
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
        [BalanceTableColumn.Pnl]: ZERO_IN_BASE,
        [BalanceTableColumn.Total]: ZERO_IN_BASE,
        [BalanceTableColumn.Available]: ZERO_IN_BASE,
        [BalanceTableColumn.TotalUsd]: stakedAmountInUsd.value,
        [BalanceTableColumn.UsedOrReserved]: stakedAmount.value
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

function shareBalance(token: TokenStatic) {
  emit('balance:share', token)
}
</script>

<template>
  <CommonEmptyList
    v-if="filteredRows.length === 0"
    :message="$t('common.noItems')"
  />

  <UTable
    v-else-if="lg"
    :rows="filteredRows"
    :columns="columns"
    :ui="{
      th: {
        base: 'leading-5',
        color: `dark:text-coolGray-400 ${props.tableHeaderClass}`
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
            is-md
            name="check-shield"
            class="text-green-500 ml-2"
          />

          <AppButton
            v-if="row.token.denom === injToken.denom"
            size="xs"
            variant="primary-ghost"
            class="text-coolGray-400 hover:bg-transparent hover:text-white focus-within:ring-0"
            @click="toggleStakingRow"
          >
            <UIcon
              class="size-4"
              :name="
                showStakingRow ? NuxtUiIcons.ChevronUp : NuxtUiIcons.ChevronDown
              "
            />
          </AppButton>
        </div>

        <AppTablePopover v-if="!row.hasNoActionButtons && !fourXl">
          <div class="rounded-lg p-2 bg-brand-800 min-w-28">
            <PartialsPortfolioBalancesSubaccountTableActionBtns
              v-if="!row.isStakingRow"
              v-bind="{
                token: row.token,
                isTablePopover: true,
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
        <SharedAmount
          class="text-white"
          v-bind="{
            amount: row[BalanceTableColumn.Available].toFixed()
          }"
          :data-cy="dataCyTag(PortfolioCyTags.BalanceAvailableAmount)"
        />
      </PartialsCommonBalanceDisplay>
      <span v-else />
    </template>

    <template #used-or-reserved-data="{ row }">
      <span v-if="row.isStakingRow" class="mr-1 text-coolGray-400">
        {{ $t('portfolio.staked') }}:
      </span>

      <SharedAmount
        v-bind="{
          showZeroAsEmDash: true,
          amount: row[BalanceTableColumn.UsedOrReserved].toFixed()
        }"
        :data-cy="dataCyTag(PortfolioCyTags.BalanceInUseOrReservedAmount)"
      />
    </template>

    <template #pnl-data="{ row }">
      <div
        v-if="!row.isStakingRow && showPnlAndRoi"
        class="flex items-center space-x-1 justify-end"
      >
        <SharedAmountUsd
          v-if="!row[BalanceTableColumn.Pnl].isZero()"
          v-bind="{
            amount: row[BalanceTableColumn.Pnl].toFixed()
          }"
          :data-cy="dataCyTag(PortfolioCyTags.BalanceUnrealisedPnl)"
          :class="getColorClassForChange(row[BalanceTableColumn.Pnl])"
        >
          <template #prefix>$</template>
        </SharedAmountUsd>
        <span v-else>&mdash;</span>

        <template v-if="!row.roiPercentage.isZero(0)">
          <span :class="getColorClassForChange(row.roiPercentage)">
            (<SharedAmount
              v-bind="{
                amount: row.roiPercentage,
                decimals: DEFAULT_PERCENTAGE_DECIMALS
              }"
            />%)
          </span>

          <PartialsPortfolioBalancesSubaccountTableShare
            :token="row.token"
            @balance:share="shareBalance"
          />
        </template>
      </div>
      <span v-else-if="!showPnlAndRoi">&mdash;</span>
      <span v-else />
    </template>

    <template #total-data="{ row }">
      <SharedAmount
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
          <SharedAmountUsd
            v-bind="{
              amount: row[BalanceTableColumn.TotalUsd].toFixed()
            }"
            :data-cy="dataCyTag(PortfolioCyTags.BalanceTotalValue)"
          >
            <template #prefix>
              <span>$</span>
            </template>
          </SharedAmountUsd>
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

  <template v-else>
    <PartialsPortfolioBalancesSubaccountMobileTable
      v-for="balance in filteredRows"
      :key="balance.token.denom"
      v-bind="{
        balance,
        columns,
        stakedAmount,
        showPnlAndRoi,
        stakedAmountInUsd
      }"
      @balance:share="shareBalance"
    />
  </template>
</template>
