<script lang="ts" setup>
import { NuxtUiIcons } from '@shared/types'
import { ZERO_IN_BASE } from '@shared/utils/constant'
import { UI_DEFAULT_MIN_DISPLAY_DECIMALS } from '@/app/utils/constants'
import { Modal } from '@/types'

const siteFullUrl = useRequestURL()
const referralStore = useReferralStore()
const modalStore = useSharedModalStore()
const notificationStore = useSharedNotificationStore()
const { t } = useLang()
const { copy } = useClipboard()

const statsList = computed(() => [
  {
    title: t('referral.myStats.rewardsEarned'),
    value: referralStore?.referralDetails?.totalCommission || ZERO_IN_BASE,
    isUsdValue: true
  },
  {
    title: t('referral.myStats.tradersReffered'),
    value: referralStore.referralDetails?.invitees?.length || 0
  }
])

const referralLink = computed(
  () =>
    `${siteFullUrl.origin}/ref/${
      referralStore.referralDetails?.referrerCode || ''
    }`
)

function copyReferral() {
  copy(referralLink.value).then(() =>
    notificationStore.success({
      title: t('referral.referralLinkCopied')
    })
  )
}

function shareReferralLink() {
  modalStore.openModal(Modal.ShareReferral)
}
</script>

<template>
  <div
    class="py-7 px-9 bg-brand-825 rounded-lg mt-8 flex gap-8 max-lg:flex-col max-sm:px-6"
  >
    <div class="flex-1">
      <h5 class="font-bold text-xl leading-none">
        {{ $t('referral.yourReferralLink') }}
      </h5>
      <p class="tracking-wide text-sm text-coolGray-450 mt-2 mb-4">
        {{ $t('referral.shareYourReferralLink') }}
      </p>

      <div
        class="rounded-md bg-brand-900 border border-[#181E31] px-5 py-4 flex justify-between items-center gap-2"
      >
        <div class="flex-1">
          <p class="text-coolGray-450 text-xs mb-1">
            {{ $t('referral.referralLink') }}
          </p>
          <p class="max-sm:text-sm break-all">
            <span>{{ siteFullUrl.origin }}/ref/</span>
            <span class="font-bold">
              {{ referralStore.referralDetails?.referrerCode || '' }}
            </span>
          </p>
        </div>
        <UIcon
          class="size-4 hover:text-blue-500 transition-colors"
          :name="NuxtUiIcons.Copy3"
          @click="copyReferral"
        />
      </div>

      <div>
        <h6 class="font-bold text-xl leading-none my-4">
          {{ $t('referral.myStats.title') }}
        </h6>

        <div class="flex gap-4 max-sm:flex-col">
          <div
            v-for="(item, index) in statsList"
            :key="index"
            class="relative flex-1 h-32"
          >
            <span
              class="block w-16 h-16 rounded-full bg-azure-blue-700 absolute z-[1] top-4 left-8"
            />
            <div
              class="relative z-[2] backdrop-blur-[50px] shadow-[0_4px_16px_rgba(0,0,0,0.1)] bg-coolGray-500/5 p-6 h-full rounded-lg"
            >
              <h6
                class="text-xs font-semibold uppercase tracking-wider leading-none mb-3"
              >
                {{ item.title }}
              </h6>

              <span
                v-if="item.isUsdValue"
                class="text-2xl font-semibold break-all"
              >
                $<AppUsdAmount
                  v-bind="{
                    amount: item.value.toFixed(),
                    decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS
                  }"
                />
                USD
              </span>
              <p v-else class="text-2xl font-semibold">
                {{ item.value }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      class="bg-brand-900 border border-[#181E31] px-20 py-7 rounded-lg flex flex-col items-center max-sm:px-6"
    >
      <PartialsReferralQRCode :text="referralLink" class="w-40" />

      <p class="tracking-wide text-coolGray-450 text-sm text-center my-4">
        {{ $t('referral.scanToJoin') }}
      </p>
      <AppButton
        size="lg"
        class="font-semibold tracking-wide w-40 flex gap-1"
        @click="shareReferralLink"
      >
        <UIcon class="size-4" :name="NuxtUiIcons.Share" />
        {{ $t('referral.share') }}
      </AppButton>
    </div>
  </div>
</template>
