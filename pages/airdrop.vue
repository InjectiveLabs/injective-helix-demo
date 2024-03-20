<script setup lang="ts">
import { ZERO_IN_WEI } from '@injectivelabs/sdk-ui-ts'
import { BigNumber, Status, StatusType } from '@injectivelabs/utils'
import { create } from 'canvas-confetti'
import { Modal } from '@/types'

const router = useRouter()
const airdropStore = useAirdropStore()
const tokenStore = useTokenStore()
const modalStore = useModalStore()
const walletStore = useWalletStore()
const { $onError } = useNuxtApp()
const { success } = useNotifications()
const { t } = useLang()

const AIRDROP_ASSET = 'PYTH'
const AIRDROP_MARKET = 'PYTH/INJ'
const AIRDROP_MARKET_SLUG = 'pyth-inj'
const MITO_VAULT =
  'https://mito.fi/vault/inj1r4pjz70l4ytk06dfparzd6na5qqjeq09fkxdt4/'
const ANNOUNCEMENT_BLOG =
  'https://blog.helixapp.com/pyth-genesis-airdrop-for-helix-users/'

const amount = ref(ZERO_IN_WEI)
const hasUserClaimed = ref(false)
const hasAgreedToTerms = ref(false)
const hasTweeted = ref(false)
const hasTweetBeenVerified = ref(false)

const status = reactive(new Status(StatusType.Idle))
const claimStatus = reactive(new Status(StatusType.Idle))
const tweetVerifyStatus = reactive(new Status(StatusType.Idle))

useForm<{ address: string; tweetId: string }>()

const {
  value: address,
  errorMessage: addressErrorMessage,
  validate: addressValidate
} = useStringField({
  name: 'address',
  rule: 'required|injAddress'
})

const {
  value: tweetId,
  setValue: setTweetIdValue,
  errorMessage: tweetIdErrorMessage,
  validate: tweetIdValidate
} = useStringField({
  name: 'tweetId',
  // eslint-disable-next-line no-useless-escape
  rule: `required|regex:^https?:\\\/\\\/([^\s]+)\\.com\\\/(?:#!\\\/)?(\\w+)\\\/status(es)?\\\/(\\d+)$`
})

const token = computed(() =>
  tokenStore.tokens.find((token) => token.symbol === AIRDROP_ASSET)
)

const { valueToString: amountToString } = useBigNumberFormatter(
  computed(() =>
    amount.value.toBase(token.value?.decimals).toFixed(2, BigNumber.ROUND_DOWN)
  )
)

watch(
  () => walletStore.isUserWalletConnected,
  (newValue, prevValue) => {
    if (walletStore.isUserWalletConnected) {
      address.value = walletStore.injectiveAddress
      checkClaimStatus()
    }

    if (prevValue && !newValue) {
      router.push('/')
    }
  },
  { immediate: true }
)

async function checkClaimStatus() {
  const { valid } = await addressValidate()

  if (!valid) {
    return
  }

  status.setLoading()

  try {
    hasUserClaimed.value = await airdropStore.fetchUserClaimStatus(
      address.value
    )
    amount.value = await airdropStore.fetchUserEligibleAirdrop(address.value)
  } catch (error) {
    $onError(error as any)
  } finally {
    status.setIdle()
  }
}

function onSetTweetId(_payload: Event) {
  if (!tweetId.value) {
    return
  }

  const tweetIdWithoutQueryString = tweetId.value.split('?')[0]

  setTweetIdValue(tweetIdWithoutQueryString)
}

function onClaimAirdrop() {
  claimStatus.setLoading()

  airdropStore
    .claim()
    .then(() => {
      hasUserClaimed.value = true
      success({
        title: t('airdrop.successNotification', {
          asset: AIRDROP_ASSET
        })
      })
      confetti()
    })
    .catch($onError)
    .finally(() => {
      claimStatus.setIdle()
    })
}

function connect() {
  modalStore.openModal(Modal.Connect)
}

function confetti() {
  const confetti = create(
    document.getElementById('confetti-airdrop') as HTMLCanvasElement,
    { resize: true }
  )

  confetti({
    particleCount: 200,
    spread: 160,
    origin: { x: 0.5, y: 0.5 }
  })
}

function tweet() {
  const width = 550
  const height = 420

  const screenTop = window.screenTop
  const screenLeft = window.screenLeft
  const windowWidth =
    window.outerWidth || window.document.documentElement.offsetWidth
  const windowHeight =
    window.outerHeight || window.document.documentElement.offsetHeight
  const windowOptions = 'scrollbars=yes,resizable=yes,toolbar=no,location=yes'
  let left = screenLeft
  let top = screenTop

  left += Math.round(windowWidth / 2 - width / 2)

  if (windowHeight > height) {
    top += Math.round(windowHeight / 2 - height / 2)
  }

  const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    t('airdrop.tweetMessage', {
      amount: amountToString.value,
      asset: AIRDROP_ASSET
    })
  )}&hashtags=Helix,Pyth,Injective#&related=HelixApp_`

  window.open(
    url,
    'intent',
    windowOptions +
      ',width=' +
      width +
      ',height=' +
      height +
      ',left=' +
      left +
      ',top=' +
      top
  )

  setTimeout(() => {
    hasTweeted.value = true
  }, 2000)
}

async function verifyTweet() {
  const { valid } = await tweetIdValidate()

  if (!valid) {
    return
  }

  tweetVerifyStatus.setLoading()

  setTimeout(() => {
    hasTweetBeenVerified.value = true
    success({ title: t('airdrop.tweetVerified') })
    tweetVerifyStatus.setIdle()
  }, 6000)
}

onMounted(() => {
  modalStore.openModal(Modal.AirdropTerms)
})
</script>

<template>
  <div class="pt-8 lg:pt-16">
    <div v-if="hasAgreedToTerms" class="max-w-lg mx-auto">
      <div class="flex items-center justify-center space-x-4 mb-8">
        <CommonTokenIcon v-if="token" v-bind="{ token }" is-lg />
        <h2 class="text-3xl font-bold">
          {{ $t('airdrop.airdrop', { asset: AIRDROP_ASSET }) }}
        </h2>
      </div>

      <p class="text-xl mb-8 text-center">
        {{ $t('airdrop.title') }}
      </p>

      <div
        v-if="!walletStore.isUserWalletConnected"
        class="flex justify-center mb-8 text-center"
      >
        <AppButton class="bg-blue-500 text-blue-900" @click="connect">
          {{ $t('connect.connectWallet') }}
        </AppButton>
      </div>

      <div v-else>
        <div class="mb-8">
          <label class="border rounded-md p-2 flex">
            <input
              v-model="address"
              type="text"
              class="bg-transparent focus:outline-none flex-1 p-2"
            />

            <div class="flex items-center" @click.stop>
              <AppButton
                class="bg-blue-500 text-blue-900"
                :is-disabled="
                  !!addressErrorMessage || status.isLoading() || hasUserClaimed
                "
                v-bind="{ status }"
                @click="checkClaimStatus"
              >
                {{ $t('airdrop.check') }}
              </AppButton>
            </div>
          </label>
          <p class="text-red-500">{{ addressErrorMessage }}</p>
        </div>

        <AppHocLoading v-bind="{ status }">
          <div v-if="hasUserClaimed">
            <i18n-t
              keypath="airdrop.claimed"
              tag="p"
              class="text-center text-xl mb-8 flex items-center gap-2 justify-center"
            >
              <template #amount>
                <span class="font-bold text-blue-500">
                  {{ amountToString }}
                </span>
              </template>
              <template #asset>
                <span class="flex items-center">
                  <CommonTokenIcon
                    v-if="token"
                    v-bind="{ token }"
                    is-md
                    class="mr-2"
                  />
                  {{ AIRDROP_ASSET }}
                </span>
              </template>
            </i18n-t>
          </div>

          <div v-else>
            <div v-if="amount.lte(0)" class="text-center text-xl mb-8">
              {{ $t('airdrop.notEligible') }}
            </div>

            <div v-if="amount.gt(0)">
              <div class="text-center text-green-500 text-xl mb-8">
                {{
                  $t('airdrop.congrats', {
                    amount: amountToString,
                    asset: AIRDROP_ASSET
                  })
                }}
              </div>

              <div
                v-if="!hasTweeted"
                class="flex justify-center mb-8"
                @click="tweet"
              >
                <AppButton
                  class="bg-blue-500 text-blue-900"
                  v-bind="{ status }"
                  @click="tweet"
                >
                  {{ $t('airdrop.tweet') }}
                </AppButton>
              </div>

              <div v-else-if="hasTweeted && !hasTweetBeenVerified" class="mb-8">
                <label class="border rounded-md p-2 flex">
                  <input
                    v-model="tweetId"
                    type="text"
                    class="bg-transparent focus:outline-none flex-1 p-2"
                    :placeholder="$t('airdrop.tweetId')"
                    @input="onSetTweetId"
                  />

                  <div class="flex items-center" @click.stop>
                    <AppButton
                      class="bg-blue-500 text-blue-900"
                      :is-disabled="
                        !!tweetIdErrorMessage || tweetVerifyStatus.isLoading()
                      "
                      v-bind="{ status: tweetVerifyStatus }"
                      @click="verifyTweet"
                    >
                      {{ $t('airdrop.verify') }}
                    </AppButton>
                  </div>
                </label>
                <p class="text-red-500">{{ tweetIdErrorMessage }}</p>
              </div>

              <div v-else class="flex justify-center mb-8">
                <AppButton
                  v-bind="{ status: claimStatus }"
                  class="bg-blue-500 text-blue-900"
                  @click="onClaimAirdrop"
                >
                  {{
                    $t('airdrop.claim', {
                      amount: amountToString,
                      asset: AIRDROP_ASSET
                    })
                  }}
                </AppButton>
              </div>
            </div>
          </div>

          <div class="p-4 bg-gray-800 rounded-md space-y-4 relative">
            <p class="text-lg font-semibold">
              {{ $t('airdrop.exploreDeFiOpportunities') }}
            </p>
            <NuxtLink
              class="flex hover:text-blue-500 items-center space-x-2"
              :to="`/spot/${AIRDROP_MARKET_SLUG}`"
            >
              <img class="h-6 w-6" src="/logo.svg" />
              <p class="flex-1 px-2">{{ $t('airdrop.tradeOnHelix') }}</p>
              <span class="text-blue-500">{{ AIRDROP_MARKET }}</span>
            </NuxtLink>

            <NuxtLink
              class="flex hover:text-blue-500 items-center space-x-2"
              target="_blank"
              :to="MITO_VAULT"
            >
              <img class="h-6 w-6" src="/svg/favicon-mito.svg" />
              <p class="flex-1 px-2">
                {{
                  $t('airdrop.automatedTradingVaultOnMito', {
                    asset: AIRDROP_ASSET
                  })
                }}
              </p>
              <span class="text-blue-500">{{ AIRDROP_MARKET }} Vault</span>
            </NuxtLink>
            <NuxtLink
              class="flex hover:text-blue-500 items-center space-x-2"
              target="_blank"
              :to="ANNOUNCEMENT_BLOG"
            >
              <img class="h-6 w-6" src="/logo.svg" />
              <p class="flex-1 px-2">
                {{ $t('airdrop.announcementBlog') }}
              </p>
              <span class="text-blue-500"> Learn more </span>
            </NuxtLink>
          </div>
        </AppHocLoading>
      </div>
    </div>

    <ModalsAirdropTerms
      v-bind="{ asset: AIRDROP_ASSET }"
      @terms:accept="hasAgreedToTerms = true"
    />

    <canvas
      id="confetti-airdrop"
      class="fixed w-full inset-0 pointer-events-none z-[1000]"
    />
  </div>
</template>
