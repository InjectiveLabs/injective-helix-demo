<script lang="ts" setup>
import { BridgeForm, BridgeField } from '@/types'

const { t } = useLang()
const bridgeFormValues = useFormValues<BridgeForm>() as Ref<BridgeForm>
const setDestinationValue = useSetFieldValue(BridgeField.Destination)
const bridgeFormErrors = useFormErrors<BridgeForm>()
const { isTransfer } = useBridgeState(bridgeFormValues)

const props = defineProps({
  walletAddress: {
    type: String,
    required: true
  }
})

const isEditing = ref(false)

const addressInputPlaceholder = computed(() => {
  if (isTransfer.value) {
    return t('bridge.inj')
  }

  return props.walletAddress
    ? t('bridge.enterAddress', {
        networkName: bridgeFormValues.value[BridgeField.BridgingNetwork]
      })
    : t('bridge.connectFundingWallet')
})

const walletAddressValue = computed({
  get(): string {
    if (!bridgeFormValues.value[BridgeField.Destination]) {
      destinationChangeWithoutValidation(
        bridgeFormValues.value[BridgeField.Destination]
      )
    } else {
      setDestinationValue(bridgeFormValues.value[BridgeField.Destination])
    }

    return bridgeFormValues.value[BridgeField.Destination]
  },
  set(address: string) {
    setDestinationValue(address)
  }
})

const destinationErrors = computed(
  () => bridgeFormErrors.value[BridgeField.Destination]
)

onMounted(() => {
  nextTick(() => destinationChangeWithoutValidation(props.walletAddress))

  if (isTransfer.value) {
    isEditing.value = true
  }
})

function onIsEditingChange(value: boolean) {
  isEditing.value = value
}

function setAddress() {
  isEditing.value = false

  nextTick(() => {
    setDestinationValue(props.walletAddress)
  })
}

function addressChange(destination: string) {
  setDestinationValue(destination)
}

function destinationChangeWithoutValidation(address: string) {
  /**
   * We shouldn't validate the field when the user clicks to edit the address
   * As to prevent unactionable error messages
   *  **/
  setDestinationValue(address, false)
}

function onPasted(address: string) {
  addressChange(address)
}

const onAddressChange = useDebounceFn(addressChange, 500)

watch(
  () => props.walletAddress,
  () => {
    setAddress()
  }
)
</script>

<template>
  <div class="mt-6">
    <AppInput
      v-model="walletAddressValue"
      is-cleared-on-paste
      :disabled="!isEditing"
      :label="$t('bridge.destinationAddress')"
      :placeholder="addressInputPlaceholder"
      wrapper-classes="py-2 px-1"
      input-classes="flex-1"
      data-cy="transfer-modal-inj-address-input"
      @input:changed="onAddressChange"
      @pasted="onPasted"
    >
      <template #addon>
        <PartialsBridgeDestinationEditButton
          v-if="!isTransfer"
          v-bind="{ isEditing, walletAddress }"
          @address:changed="destinationChangeWithoutValidation"
          @isEditing:changed="onIsEditingChange"
        />
      </template>
    </AppInput>
    <p v-if="destinationErrors" class="text-red-500 text-xs mt-1">
      {{ destinationErrors }}
    </p>
  </div>
</template>
