<script lang="ts" setup>
import { Status, StatusType } from '@injectivelabs/utils'
import { Wallet, isCosmosWallet } from '@injectivelabs/wallet-ts'
import {
  CAMPAIGN_WINNER_MESSAGE,
  PAST_LEADERBOARD_CAMPAIGN_NAMES
} from '@/app/data/campaign'
import { getEip712TypedData } from '@/app/utils/wallet'
import {
  Modal,
  MainPage,
  CompetitionWinnerField,
  CompetitionWinnerForm
} from '@/types'

const appStore = useAppStore()
const accountStore = useAccountStore()
const campaignStore = useCampaignStore()
const modalStore = useSharedModalStore()
const sharedWalletStore = useSharedWalletStore()
const notificationStore = useSharedNotificationStore()
const { t } = useLang()
const { $onError } = useNuxtApp()
const { validate } = useForm<CompetitionWinnerForm>()

const [latestCampaign] = PAST_LEADERBOARD_CAMPAIGN_NAMES

const isShowClaimForm = ref(false)
const submitStatus = reactive(new Status(StatusType.Idle))
const fetchWinnerStatus = reactive(new Status(StatusType.Loading))

const { value: name, errors: nameErrors } = useStringField({
  name: CompetitionWinnerField.Name
})

const { value: email, errors: emailErrors } = useStringField({
  name: CompetitionWinnerField.Email,
  rule: 'required|email'
})

const isShowBannerOrModal = computed(
  () =>
    campaignStore.leaderboardCompetitionResult &&
    !campaignStore.leaderboardCompetitionResult.hasClaimed
)

const claimMessage = computed(() =>
  sharedWalletStore.wallet !== Wallet.Magic
    ? CAMPAIGN_WINNER_MESSAGE
    : JSON.stringify(
        getEip712TypedData(sharedWalletStore.address, CAMPAIGN_WINNER_MESSAGE)
      )
)

onWalletConnected(() => {
  Promise.all([
    campaignStore.fetchLeaderboardCompetitionResults(
      latestCampaign,
      sharedWalletStore.injectiveAddress
    ),
    accountStore.fetchPubKey(sharedWalletStore.injectiveAddress)
  ])
    .then(() => {
      if (!isShowBannerOrModal.value) {
        return
      }

      if (appStore.userState.modalsViewed.includes(Modal.CompetitionWinner)) {
        return
      }

      openModal()
    })
    .catch($onError)
    .finally(() => fetchWinnerStatus.setIdle())
})

function onClose() {
  modalStore.closeModal(Modal.CompetitionWinner)

  appStore.setUserState({
    ...appStore.userState,
    modalsViewed: [...appStore.userState.modalsViewed, Modal.CompetitionWinner]
  })

  isShowClaimForm.value = false
}

function openModal() {
  modalStore.openModal(Modal.CompetitionWinner)
}

function onShowClaimForm() {
  isShowClaimForm.value = true
}

async function onSubmit(signature: string) {
  const { valid } = await validate()

  if (!valid) {
    return
  }

  submitStatus.setLoading()

  campaignStore
    .submitLeaderboardCompetitionClaim({
      signature,
      name: name.value,
      email: email.value,
      competitionName: latestCampaign,
      message: claimMessage.value,
      wallet: sharedWalletStore.wallet,
      injectiveAddress: sharedWalletStore.injectiveAddress,
      ...(isCosmosWallet(sharedWalletStore.wallet) ||
      sharedWalletStore.wallet === Wallet.Magic
        ? { pubKey: accountStore.pubKey }
        : {})
    })
    .then(() => {
      notificationStore.success({
        title: t('leaderboard.competition.winnerModal.receivedInformation')
      })
    })
    .catch($onError)
    .finally(() => {
      submitStatus.setIdle()
      onClose()
    })
}
</script>

<template>
  <div v-if="isShowBannerOrModal">
    <AppHocLoading v-bind="{ status: fetchWinnerStatus }">
      <div>
        <div
          v-if="!modalStore.modals[Modal.CompetitionWinner]"
          class="text-xs md:text-sm font-medium leading-3 md:leading-[18px] text-center py-1.5 px-4 md:px-10 bg-[#66B1EF] text-coolGray-925 relative z-40 cursor-pointer"
          @click="openModal"
        >
          {{
            $t('leaderboard.competition.winnerModal.bannerDescription', {
              prize: campaignStore.leaderboardCompetitionResult?.prize
            })
          }}
        </div>

        <AppModal
          v-else
          is-md
          is-stay-open-on-resize
          :is-open="modalStore.modals[Modal.CompetitionWinner]"
          @modal:closed="onClose"
        >
          <div class="relative max-w-[400px] mx-auto">
            <CommonSuccessMessage
              :title="
                $t(
                  `leaderboard.competition.winnerModal.${
                    isShowClaimForm ? 'contactInfo' : 'getStarted'
                  }.title`
                )
              "
            >
              <template #default>
                <div
                  v-if="!isShowClaimForm"
                  class="font-bold text-sm text-white leading-[18px]"
                >
                  {{
                    $t(
                      'leaderboard.competition.winnerModal.getStarted.description',
                      {
                        competition: latestCampaign,
                        prize: campaignStore.leaderboardCompetitionResult?.prize
                      }
                    )
                  }}
                </div>
                <template v-else>
                  <i18n-t
                    keypath="leaderboard.competition.winnerModal.contactInfo.description"
                    tag="p"
                    class="font-bold text-sm text-white leading-[18px]"
                  >
                    <template #terms>
                      <NuxtLink
                        :to="{ name: MainPage.LikeAGCompetitionTerms }"
                        class="text-blue-500 hover:opacity-50"
                        @click="onClose"
                      >
                        {{ $t('leaderboard.rulesTermsAndConditions') }}
                      </NuxtLink>
                    </template>

                    <template #privacyPolicy>
                      <NuxtLink
                        :to="{ name: MainPage.CompetitionPrivacyPolicyTesla }"
                        class="text-blue-500 hover:opacity-50"
                        @click="onClose"
                      >
                        {{ $t('leaderboard.privacyPolicy') }}
                      </NuxtLink>
                    </template>
                  </i18n-t>
                </template>
              </template>
            </CommonSuccessMessage>

            <div class="mt-6 flex items-center justify-center gap-3">
              <AppButton
                v-if="!isShowClaimForm"
                class="bg-blue-500 text-blue-900 font-semibold"
                @click="onShowClaimForm"
              >
                {{ $t('leaderboard.competition.winnerModal.getStarted.cta') }}
              </AppButton>

              <div v-else class="flex flex-col items-center w-full max-w-80">
                <div class="mb-4 w-full">
                  <div
                    class="flex flex-col items-center py-2.5 px-2 border rounded-md"
                  >
                    <AppInput
                      v-model="name"
                      v-bind="{
                        isTransparentBg: true,
                        placeholder: $t(
                          'leaderboard.competition.winnerModal.namePlaceholder'
                        ),
                        disabled: submitStatus.isLoading()
                      }"
                      class="font-semibold leading-4"
                    />
                  </div>

                  <span
                    v-if="nameErrors.length > 0"
                    class="text-red-500 capitalize text-xs"
                  >
                    {{ nameErrors[0] }}
                  </span>
                </div>

                <div class="mb-6 w-full">
                  <div
                    class="flex flex-col items-center py-2.5 px-2 border rounded-md"
                  >
                    <AppInput
                      v-model="email"
                      v-bind="{
                        isTransparentBg: true,
                        placeholder: $t(
                          'leaderboard.competition.winnerModal.emailPlaceholder'
                        ),
                        disabled: submitStatus.isLoading()
                      }"
                      class="font-semibold leading-4"
                    />
                  </div>

                  <span
                    v-if="emailErrors.length > 0"
                    class="text-red-500 capitalize text-xs"
                  >
                    {{ emailErrors[0] }}
                  </span>
                </div>

                <ModalsCompetitionWinnerSubmitButton
                  v-bind="{ submitStatus, claimMessage }"
                  @submit="onSubmit"
                />
              </div>
            </div>
          </div>
        </AppModal>
      </div>
    </AppHocLoading>
  </div>
</template>
