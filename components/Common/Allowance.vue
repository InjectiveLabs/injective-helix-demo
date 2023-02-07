<script lang="ts" setup>
import { PropType } from 'vue'
import { Status, StatusType } from '@injectivelabs/utils'
import { BalanceWithToken } from '@/types'

const tokenStore = useTokenStore()
const { $onError } = useNuxtApp()
const { success } = useNotifications()
const { t } = useLang()

const props = defineProps({
  tokenWithBalance: {
    type: Object as PropType<BalanceWithToken>,
    required: true
  }
})

const emit = defineEmits<{
  (e: 'allowance:set'): void
}>()

const status = reactive(new Status(StatusType.Idle))

function handleSetAllowance() {
  status.setLoading()

  tokenStore
    .setTokenAllowance(props.tokenWithBalance)
    .then(() => {
      emit('allowance:set')

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
    <AppButton
      lg
      :status="status"
      class="w-full bg-blue-500 text-blue-900 font-semibold"
      data-cy="allowance-modal-set-button"
      @click="handleSetAllowance"
    >
      {{ $t('bridge.setAllowance') }}
    </AppButton>
  </div>
</template>
