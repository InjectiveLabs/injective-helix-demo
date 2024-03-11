<script setup lang="ts">
import {
  Coin,
  MsgExecuteContractCompat,
  fromBase64,
  toBase64
} from '@injectivelabs/sdk-ts'
import { ZERO_IN_WEI } from '@injectivelabs/sdk-ui-ts'
import { BigNumberInWei, Status, StatusType } from '@injectivelabs/utils'
import { create } from 'canvas-confetti'
import { Modal } from '@/types'
import { msgBroadcastClient, wasmApi } from '@/app/Services'

const REWARDS_CONTRACT = 'inj135qvnawxk6llfchya2fve7cw4aukmg0xfz9ea7'
const CAMPAING_ID = 1
const PYTH_DECIMALS = 6

const router = useRouter()
const tokenStore = useTokenStore()
const modalStore = useModalStore()
const walletStore = useWalletStore()
const { $onError } = useNuxtApp()
const { success } = useNotifications()
const { t } = useLang()

const status = reactive(new Status(StatusType.Idle))
const claimStatus = reactive(new Status(StatusType.Idle))

useForm<{ address: string }>()

const {
  value: address,
  errorMessage,
  validate
} = useStringField({
  name: 'address',
  rule: 'required|injAddress'
})

const amount = ref(ZERO_IN_WEI)
const isClaimed = ref(false)
const sucessfulyClaimed = ref(false)

const hasAggreed = ref(false)

const token = computed(() =>
  tokenStore.tokens.find((token) => token.symbol === 'PYTH')
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

const { valueToString: amountToString } = useBigNumberFormatter(
  computed(() => amount.value.toBase(token.value?.decimals || PYTH_DECIMALS))
)

async function checkClaim() {
  const response = (await wasmApi.fetchSmartContractState(
    REWARDS_CONTRACT,
    toBase64({
      user_has_claimed: {
        campaign_id: CAMPAING_ID,
        user: address.value
      }
    })
  )) as unknown as { data: string }

  const userHasClaimed = fromBase64(response.data) as unknown as boolean

  return userHasClaimed
}

async function fetchUserRewards() {
  const response = (await wasmApi.fetchSmartContractState(
    REWARDS_CONTRACT,
    toBase64({
      user_reward: {
        campaign_id: CAMPAING_ID,
        user: address.value
      }
    })
  )) as unknown as { data: string }

  const userReward = fromBase64(response.data) as unknown as Coin[]

  return userReward[0].amount
}

function connect() {
  modalStore.openModal(Modal.Connect)
}

async function checkClaimStatus() {
  const { valid } = await validate()

  if (!valid) {
    return
  }

  status.setLoading()

  try {
    isClaimed.value = await checkClaim()
    amount.value = new BigNumberInWei(await fetchUserRewards())
  } catch (error) {
    $onError(error as any)
  } finally {
    status.setIdle()
  }
}

const claimReward = async () => {
  const appStore = useAppStore()
  const walletStore = useWalletStore()

  await appStore.queue()
  await walletStore.validate()

  if (!walletStore.address) {
    return
  }

  const message = MsgExecuteContractCompat.fromJSON({
    sender: walletStore.injectiveAddress,
    contractAddress: REWARDS_CONTRACT,
    exec: {
      action: 'claim_reward',
      msg: { campaign_id: CAMPAING_ID }
    }
  })

  const tx = await msgBroadcastClient.broadcastWithFeeDelegation({
    msgs: [message],
    injectiveAddress: walletStore.injectiveAddress
  })

  return tx
}

function onClaimRewards() {
  claimStatus.setLoading()

  claimReward()
    .then(() => {
      sucessfulyClaimed.value = true
      isClaimed.value = true
      success({ title: t('pyth.successNotification') })

      confetti()
    })
    .catch($onError)
    .finally(() => {
      claimStatus.setIdle()
    })
}

function confetti() {
  const confetti = create(
    document.getElementById('confetti-pyth') as HTMLCanvasElement,
    { resize: true }
  )

  confetti({
    particleCount: 200,
    spread: 160,
    origin: { x: 0.5, y: 0.5 }
  })
}

onMounted(() => {
  modalStore.openModal(Modal.PythAirdrop)
})
</script>

<template>
  <div class="pt-8 lg:pt-16">
    <div v-if="hasAggreed" class="max-w-lg mx-auto">
      <div class="flex items-center justify-center space-x-4 mb-8">
        <CommonTokenIcon v-if="token" v-bind="{ token }" is-lg />
        <h2 class="text-3xl font-bold">{{ $t('pyth.pythAirdrop') }}</h2>
      </div>

      <p class="text-xl mb-8">
        {{ $t('pyth.title') }}
      </p>

      <div
        v-if="!walletStore.isUserWalletConnected"
        class="flex justify-center mb-8"
      >
        <AppButton class="bg-blue-500 text-black" @click="connect">
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
                class="bg-blue-500 text-black"
                :is-disabled="!!errorMessage || status.isLoading() || isClaimed"
                v-bind="{ status }"
                @click="checkClaimStatus"
              >
                {{ $t('pyth.check') }}
              </AppButton>
            </div>
          </label>
          <p class="text-red-500">{{ errorMessage }}</p>
        </div>

        <AppHocLoading v-bind="{ status }">
          <div
            v-if="isClaimed && !sucessfulyClaimed"
            class="text-center text-xl mb-8"
          >
            <p>{{ $t('pyth.alreadyClaimed') }}</p>
          </div>

          <div v-if="amount.eq(0)" class="text-center text-xl mb-8">
            {{ $t('pyth.notEligible') }}
          </div>

          <div v-if="amount.gt(0) && !isClaimed">
            <div class="text-center text-green-500 text-xl mb-8">
              {{ $t('pyth.congrats', { amount: amountToString }) }}
            </div>

            <div class="flex justify-center mb-8">
              <AppButton
                v-bind="{ status: claimStatus }"
                class="bg-blue-500 text-black"
                @click="onClaimRewards"
              >
                {{ $t('pyth.claim', { amount: amountToString }) }}
              </AppButton>
            </div>
          </div>

          <div v-if="sucessfulyClaimed" class="text-center text-xl mb-8">
            {{ $t('pyth.claimed', { amount: amountToString }) }}
          </div>
        </AppHocLoading>

        <div
          v-if="isClaimed"
          class="p-4 bg-gray-800 rounded-md space-y-4 relative"
        >
          <p class="text-lg font-semibold">
            {{ $t('pyth.exploreDeFiOpportunities') }}
          </p>
          <NuxtLink
            class="flex hover:text-blue-500 items-center space-x-2"
            to="/spot/pyth-inj"
          >
            <img class="h-6 w-6" src="/logo.svg" />
            <p class="flex-1 px-2">{{ $t('pyth.tradeOnHelix') }}</p>
            <span class="text-blue-500">PYTH/INJ</span>
          </NuxtLink>

          <NuxtLink
            class="flex hover:text-blue-500 items-center space-x-2"
            target="_blank"
            to="https://mito.fi/vault/inj1r4pjz70l4ytk06dfparzd6na5qqjeq09fkxdt4/"
          >
            <img class="h-6 w-6" src="/svg/favicon-mito.svg" />
            <p class="flex-1 px-2">
              {{ $t('pyth.automatedTradingVaultOnMito') }}
            </p>
            <span class="text-blue-500">PYTH/INJ Vault</span>
          </NuxtLink>
        </div>
      </div>
    </div>

    <ModalsPythAirdrop @terms:accept="hasAggreed = true" />

    <canvas
      id="confetti-pyth"
      class="fixed w-full inset-0 pointer-events-none z-[1000]"
    />
  </div>
</template>
