<script setup lang="ts">
import { BridgingNetwork } from '@injectivelabs/sdk-ui-ts'
import { Status, StatusType } from '@injectivelabs/utils'
import { injToken } from '~/app/data/token'
import { BridgeField, BridgeForm, BridgeType } from '~/types'

definePageMeta({
  middleware: [
    'connected',
    (to) => {
      if (to.name === 'bridge') {
        return navigateTo({ name: 'bridge-deposit' })
      }
    }
  ]
})

const peggyStore = usePeggyStore()
const accountStore = useAccountStore()
const { $onError } = useNuxtApp()

const { values: formValues } = useForm<BridgeForm>({
  initialValues: {
    [BridgeField.BridgingNetwork]: BridgingNetwork.Ethereum,
    [BridgeField.BridgeType]: BridgeType.Deposit,
    [BridgeField.Token]: injToken,
    [BridgeField.Denom]: injToken.denom,
    [BridgeField.Amount]: '',
    [BridgeField.Memo]: '',
    [BridgeField.Destination]: ''
  },
  keepValuesOnUnmount: true
})

onMounted(() => {
  fetchData()
})

function fetchData() {
  status.setLoading()

  Promise.all([
    accountStore.fetchAccountPortfolio(),
    peggyStore.getErc20BalancesWithTokenAndPrice()
  ])
    .catch($onError)
    .finally(() => {
      status.setIdle()
    })
}

const status = reactive(new Status(StatusType.Idle))
</script>

<template>
  <div class="grid place-items-center min-h-full">
    {{ formValues }}
    <div class="max-w-90% w-[448px]">
      <div>
        <div class="flex justify-start mb-6">
          <NuxtLink
            class="text-xs uppercase tracking-wide cursor-pointer"
            active-class="text-blue-500"
            :to="{ name: 'bridge-deposit' }"
          >
            {{ $t('account.deposit') }}
          </NuxtLink>

          <CommonSeparator />

          <NuxtLink
            class="text-xs uppercase tracking-wide cursor-pointer"
            active-class="text-blue-500"
            :to="{ name: 'bridge-withdraw' }"
          >
            {{ $t('account.withdraw') }}
          </NuxtLink>
        </div>
      </div>
      <div class="p-6 bg-gray-850 rounded-lg">
        <AppHocLoading v-bind="{ status }">
          <ModalsBridgeNetworkSelect>
            <template #title>
              <span
                v-if="formValues[BridgeField.BridgeType] === BridgeType.Deposit"
              >
                {{ $t('bridge.selectOriginNetwork') }}
              </span>
              <span v-else>
                {{ $t('bridge.selectDestinationNetwork') }}
              </span>
            </template>
          </ModalsBridgeNetworkSelect>
          <NuxtPage />
        </AppHocLoading>
      </div>
    </div>
  </div>
</template>
