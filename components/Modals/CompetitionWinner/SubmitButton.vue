<script lang="ts" setup>
import { Status, StatusType } from '@injectivelabs/utils'
import { isCosmosWallet } from '@injectivelabs/wallet-ts'
import { CompetitionWinnerField } from '@/types'

const formErrors = useFormErrors()
const walletStore = useWalletStore()
const competitionFormValues = useFormValues()
const sharedWalletStore = useSharedWalletStore()
const { $onError } = useNuxtApp()

const props = withDefaults(
  defineProps<{
    claimMessage: string
    submitStatus: Status
  }>(),
  {}
)

const emit = defineEmits<{
  submit: [signature: string]
}>()

const signingStatus = reactive(new Status(StatusType.Idle))

const hasErrors = computed(
  () =>
    Object.keys(formErrors.value).length > 0 ||
    !competitionFormValues.value[CompetitionWinnerField.Name] ||
    !competitionFormValues.value[CompetitionWinnerField.Email]
)

function onSignMessage() {
  signingStatus.setLoading()

  const address = isCosmosWallet(sharedWalletStore.wallet)
    ? sharedWalletStore.injectiveAddress
    : sharedWalletStore.address

  walletStore
    .signArbitraryData(address, props.claimMessage)
    .then((signature) => {
      if (!signature) {
        return
      }

      const isMissing0xPrefix =
        !isCosmosWallet(sharedWalletStore.wallet) && !signature.startsWith('0x')

      emit('submit', isMissing0xPrefix ? `0x${signature}` : signature)
    })
    .catch($onError)
    .finally(() => {
      signingStatus.setIdle()
    })
}
</script>

<template>
  <AppButton
    class="disabled:border-coolGray-400 bg-blue-500 text-blue-900 font-semibold"
    v-bind="{
      disabled:
        hasErrors || signingStatus.isLoading() || submitStatus.isLoading(),
      isLoading: signingStatus.isLoading() || submitStatus.isLoading(),
      variant: hasErrors ? 'primary-outline' : 'primary'
    }"
    @click="onSignMessage"
  >
    {{ $t('leaderboard.competition.winnerModal.contactInfo.cta') }}
  </AppButton>
</template>
