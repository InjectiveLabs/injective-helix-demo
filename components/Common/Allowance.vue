<script lang="ts" setup>
import { PropType } from 'vue'
import { Status, StatusType } from '@injectivelabs/utils'
import { TokenWithBalance } from '@injectivelabs/sdk-ui-ts'

const tokenStore = useTokenStore()
const { $onError } = useNuxtApp()
const { success } = useNotifications()
const { t } = useLang()

const props = defineProps({
  tokenWithBalance: {
    type: Object as PropType<TokenWithBalance>,
    required: true
  }
})

const emit = defineEmits<{
  (e: 'unlocked'): void
}>()

const status = reactive(new Status(StatusType.Idle))

function handleClickOnSetAllowance() {
  const { tokenWithBalance } = props

  status.setLoading()

  tokenStore
    .setTokenAllowance(tokenWithBalance)
    .then(() => {
      emit('unlocked')

      success({
        title: t('bridge.successfullySetAllowance')
      })
    })
    .catch($onError)
    .finally(() => {
      status.setIdle()
    })
}
</script>

<template>
  <div class="w-full">
    <p class="mb-4">
      {{ $t('bridge.setAllowanceFor', { asset: tokenWithBalance.symbol }) }}
    </p>
    <AppButton
      lg
      :status="status"
      class="w-full bg-blue-500 text-blue-900 font-semibold"
      data-cy="allowance-modal-set-button"
      @click="handleClickOnSetAllowance"
    >
      {{ $t('bridge.setAllowance') }}
    </AppButton>
  </div>
</template>
