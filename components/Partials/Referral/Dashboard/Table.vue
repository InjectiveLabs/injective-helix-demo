<script lang="ts" setup>
import { ReferralTableColumn } from '@/types'

const referralStore = useReferralStore()
const { t } = useLang()

withDefaults(
  defineProps<{
    hasReferralLink?: boolean
  }>(),
  {}
)

const columns = [
  {
    key: ReferralTableColumn.Wallets,
    label: t(`referral.table.${ReferralTableColumn.Wallets}`)
  },
  {
    key: ReferralTableColumn.Commission,
    label: t(`referral.table.${ReferralTableColumn.Commission}`),
    class: 'text-center'
  },
  {
    key: ReferralTableColumn.JoinDate,
    label: t(`referral.table.${ReferralTableColumn.JoinDate}`),
    class: 'text-center'
  }
]

const { rows } = useReferralTransformer(
  computed(() => referralStore.referralDetails?.invitees || [])
)
</script>

<template>
  <div class="py-8 px-6 bg-brand-825 rounded-lg mt-8 flex flex-col gap-4">
    <PartialsReferralDashboardTableHeader
      v-bind="{ hasReferralLink, isEmpty: rows.length === 0 }"
    />

    <UTable
      v-if="hasReferralLink"
      :rows="rows"
      :columns="columns"
      :ui="{
        base: 'border-0',
        divide: 'divide-y-0',
        th: { padding: 'py-3 max-xs:px-2' },
        tbody: 'bg-coolGray-950 dark:divide-brand-800'
      }"
    >
      <template #empty-state>
        <CommonEmptyList
          class="pt-12 pb-12"
          :message="$t('referral.noReferrals')"
        />
      </template>

      <template #wallets-data="{ row }">
        <span class="p-2 max-xs:px-0">
          {{ row.formattedAddress }}
        </span>
      </template>

      <template #commission-data="{ row }">
        <div class="p-2 max-xs:px-0 text-center text-green-500">
          $<AppUsdAmount
            v-bind="{
              amount: row.commission.toFixed()
            }"
          />
        </div>
      </template>

      <template #join-date-data="{ row }">
        <span class="p-2 max-xs:px-0 block w-full text-center font-mono">
          {{ row.joinDate }}
        </span>
      </template>
    </UTable>
  </div>
</template>
