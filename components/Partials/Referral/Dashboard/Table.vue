<script lang="ts" setup>
import { ReferralTableColumn } from '@/types'

const { t } = useLang()

const props = withDefaults(
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

const referralList = computed(() => {
  const mockData = [
    {
      commission: 200,
      timestamp: '2025-01-25',
      address: 'inj17gkuet8f6pssxd8nycm3qr9d9y699rupv6397z'
    },
    {
      commission: 188,
      timestamp: '2025-01-25',
      address: 'inj1m0ly9d7fnyhfwunhxm99s5sufak6tg77c7r743'
    },
    {
      commission: 888,
      timestamp: '2025-01-25',
      address: 'inj1m0ly9d7fnyhfwunhxm99s5sufak6tg77c7r743'
    },
    {
      commission: 588,
      timestamp: '2025-01-25',
      address: 'inj17gkuet8f6pssxd8nycm3qr9d9y699rupv6397z'
    },
    {
      commission: 177,
      timestamp: '2025-01-25',
      address: 'inj17gkuet8f6pssxd8nycm3qr9d9y699rupv6397z'
    }
  ]

  return props.hasReferralLink ? mockData : []
})

const { rows } = useReferralTransformer(computed(() => referralList.value))
</script>

<template>
  <div class="py-8 px-6 bg-brand-825 rounded-lg mt-8 flex flex-col gap-4">
    <PartialsReferralDashboardTableHeader v-bind="{ hasReferralLink }" />

    <UTable
      :rows="rows"
      :columns="columns"
      :ui="{
        base: 'border-0',
        divide: 'divide-y-0',
        th: { padding: 'py-3' },
        tbody: 'bg-coolGray-950 dark:divide-brand-800'
      }"
    >
      <template #wallets-data="{ row }">
        <span class="p-2">
          {{ row.formattedAddress }}
        </span>
      </template>

      <template #commission-data="{ row }">
        <div class="p-2 text-center text-green-500">
          $<AppUsdAmount
            v-bind="{
              amount: row.commission.toFixed()
            }"
          />
        </div>
      </template>

      <template #join-date-data="{ row }">
        <span class="p-2 block w-full text-center font-mono">
          {{ row.timestamp }}
        </span>
      </template>
    </UTable>
  </div>
</template>
