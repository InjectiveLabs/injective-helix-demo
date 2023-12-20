<script lang="ts" setup>
import { BridgingNetwork } from '@injectivelabs/sdk-ui-ts'
import { INJ_DENOM } from '@injectivelabs/utils'
import { BINANCE_DEPOSIT_ADDRESSES } from '@/app/utils/constants'
import { BridgeForm, BridgeField } from '@/types'

const formValues = useFormValues<BridgeForm>() as Ref<BridgeForm>
const setFormValues = useSetFormValues()
const walletStore = useWalletStore()

const emit = defineEmits<{
  'ibc:connect': [state: BridgingNetwork]
}>()

const memoRequired = ref(false)

const { value: memo, resetField: resetMemo } = useStringField({
  rule: '',
  name: BridgeField.Memo,
  dynamicRule: computed(() => (memoRequired.value ? 'required' : ''))
})

onMounted(() => {
  setFormValues(
    {
      [BridgeField.BridgingNetwork]: BridgingNetwork.Injective,
      [BridgeField.Denom]: INJ_DENOM,
      [BridgeField.Destination]: ''
    },
    false
  )
})

onBeforeUnmount(() => {
  setFormValues(
    {
      [BridgeField.BridgingNetwork]: walletStore.isCosmosWallet
        ? BridgingNetwork.CosmosHub
        : BridgingNetwork.Ethereum
    },
    false
  )

  if (walletStore.isCosmosWallet) {
    emit('ibc:connect', formValues.value[BridgeField.BridgingNetwork])
  }
})

watch(
  () => formValues.value[BridgeField.Destination],
  (value: string) => {
    if (BINANCE_DEPOSIT_ADDRESSES.includes(value)) {
      memoRequired.value = true
    } else {
      setFormValues(
        {
          [BridgeField.Memo]: ''
        },
        false
      )

      memoRequired.value = false
    }
  }
)
</script>

<template>
  <div class="mt-6">
    <div>
      <slot name="destination-address" />
      <div class="my-4 w-full">
        <div class="flex items-center justify-between text-gray-200">
          <AppTooltip :content="$t('memo.memoTooltip')">
            <span class="text-xs flex items-center">
              {{ $t('memo.memo') }}
              <BaseIcon name="circle-info" class="text-gray-500 w-3 h-3 ml-2" />
            </span>
          </AppTooltip>

          <AppCheckbox v-model="memoRequired" @input="resetMemo">
            {{ $t('common.required') }}
          </AppCheckbox>
        </div>
        <div v-if="memoRequired" class="mt-2">
          <AppInput
            v-model="memo"
            wrapper-classes="py-2 px-1"
            :placeholder="$t('memo.memoPlaceholder')"
          />
        </div>
      </div>
    </div>

    <div class="mt-4">
      <slot />
    </div>
  </div>
</template>
