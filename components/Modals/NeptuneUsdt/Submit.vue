<script lang="ts" setup>
import { Status, BigNumberInBase } from '@injectivelabs/utils'
import { NeptuneUsdtForm, NeptuneUsdtField } from '@/types'

const neptuneUsdtFormErrors = useFormErrors()
const sharedWalletStore = useSharedWalletStore()
const neptuneUsdtFormValues = useFormValues() as Ref<NeptuneUsdtForm>

withDefaults(
  defineProps<{
    status?: Status
  }>(),
  {
    status: () => new Status()
  }
)

const emit = defineEmits<{
  submit: []
}>()

const isValid = computed(() => {
  if (
    sharedWalletStore.isAuthzWalletConnected ||
    sharedWalletStore.isAutoSignEnabled
  ) {
    return
  }

  if (
    new BigNumberInBase(
      neptuneUsdtFormValues.value[NeptuneUsdtField.Amount] || 0
    ).lte(0)
  ) {
    return
  }

  return Object.keys(neptuneUsdtFormErrors.value).length === 0
})

function onSubmit() {
  emit('submit')
}
</script>

<template>
  <AppButton
    class="w-full"
    v-bind="{
      isLg: true,
      isPrimary: true,
      disabled: !isValid,
      isLoading: status.isLoading()
    }"
    @click="onSubmit"
  >
    {{ $t('trade.neptuneUsdt.submit') }}
  </AppButton>
</template>
