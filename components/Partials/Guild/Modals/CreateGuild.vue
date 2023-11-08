<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import { toBalanceInToken } from '@/app/utils/formatters'
import { GUILD_BASE_TOKEN_SYMBOL } from 'app/utils/constants'
import { Modal } from '@/types'

const modalStore = useModalStore()
const walletStore = useWalletStore()
const campaignStore = useCampaignStore()
const { t } = useLang()
const { validate } = useForm()
const { $onError } = useNuxtApp()
const { success } = useNotifications()

const MAX_CHARACTERS = 30
const NAME_FIELD = 'guild-name'
const MIN_AMOUNT = 10000
const JOIN_GUILD_LINK = 'https://twitter.com/HelixApp_'

const status = reactive(new Status(StatusType.Idle))

const { accountBalancesWithToken } = useBalance()

const { value: name, errors: nameErrors } = useStringField({
  name: NAME_FIELD,
  rule: `required|maxCharacter:${MAX_CHARACTERS}`
})

const { valueToString: minAmountToString } = useBigNumberFormatter(
  computed(() => MIN_AMOUNT)
)

const { valueToString: balanceToString, valueToBigNumber: balanceToBigNumber } =
  useBigNumberFormatter(
    computed(() => {
      const balance = accountBalancesWithToken.value.find(
        ({ token }) => token.symbol.toUpperCase() === GUILD_BASE_TOKEN_SYMBOL
      )

      if (!balance) {
        return 0
      }

      return toBalanceInToken({
        value: balance.accountTotalBalance,
        decimalPlaces: balance.token.decimals
      })
    })
  )

const hasSufficientBalance = computed(() =>
  balanceToBigNumber.value.gte(MIN_AMOUNT)
)

function handleDisconnect() {
  walletStore.disconnect()

  onCloseModal()
}

function onCloseModal() {
  modalStore.closeModal(Modal.CreateGuild)
}

async function onSubmit() {
  const { valid } = await validate()

  if (!valid) {
    return
  }

  status.setLoading()

  campaignStore
    .createGuild({
      name: name.value
    })
    .then(() => {
      success({
        title: t('guild.createGuild.toast')
      })
      onCloseModal()
    })
    .catch($onError)
    .finally(() => {
      status.setIdle()
    })
}
</script>

<template>
  <AppModal
    sm
    :is-open="modalStore.modals[Modal.CreateGuild]"
    @modal:closed="onCloseModal"
  >
    <template #title>
      <h2 class="text-xl font-semibold normal-case">
        {{ $t('guild.createGuild.title') }}
      </h2>
    </template>

    <div>
      <div class="flex items-center justify-between text-xs mb-2">
        <span class="font-bold">
          {{ $t('guild.createGuild.name') }}
        </span>
        <span class="text-gray-450">
          {{ name?.length || 0 }} / {{ MAX_CHARACTERS }}
          {{ $t('guild.createGuild.characters') }}
        </span>
      </div>

      <AppInput
        v-model="name"
        sm
        wrapper-classes="p-2"
        :errors="nameErrors"
        :placeholder="$t('guild.createGuild.namePlaceholder')"
      />
      <p
        v-if="nameErrors[0]"
        class="text-red-500 first-letter:uppercase text-sm mt-1"
      >
        {{ nameErrors[0] }}
      </p>

      <div class="flex items-center justify-between text-xs mb-2 mt-8">
        <span class="font-bold">
          {{ $t('guild.createGuild.masterAddress') }}
        </span>
        <span
          class="font-semibold text-blue-500 hover:text-opacity-80 cursor-pointer"
          @click="handleDisconnect"
        >
          {{ $t('navigation.disconnect') }}
        </span>
      </div>
      <AppInput
        sm
        disabled
        :model-value="walletStore.injectiveAddress"
        wrapper-classes="p-2"
        :placeholder="$t('guild.createGuild.namePlaceholder')"
      />

      <div class="flex justify-between mt-2">
        <span class="font-semibold text-xs">
          {{
            $t('guild.createGuild.balanceInWallet', {
              symbol: GUILD_BASE_TOKEN_SYMBOL
            })
          }}
        </span>
        <div class="flex items-center font-semibold text-xs gap-1">
          <span>{{ balanceToString }} {{ GUILD_BASE_TOKEN_SYMBOL }}</span>
          <BaseIcon
            v-if="balanceToBigNumber.gte(MIN_AMOUNT)"
            name="check-circle"
            class="text-green-500"
            is-sm
          />
          <BaseIcon
            v-else
            name="warning-circle"
            class="text-orange-400"
            is-sm
          />
        </div>
      </div>

      <p v-if="!hasSufficientBalance" class="text-gray-450 text-xs mt-2">
        {{
          $t('guild.createGuild.insufficientBalanceDescription', {
            amount: minAmountToString,
            symbol: GUILD_BASE_TOKEN_SYMBOL
          })
        }}
      </p>

      <div class="mt-8">
        <AppButton
          class="w-full bg-blue-500 text-white font-semibold"
          v-bind="{
            status,
            lg: true,
            disabled: !hasSufficientBalance || !name
          }"
          @click="onSubmit"
        >
          <span v-if="hasSufficientBalance" :class="{ 'text-gray-600': !name }">
            {{ $t('guild.createGuild.cta') }}
          </span>
          <span v-else class="text-gray-600">
            {{ $t('guild.createGuild.insufficientBalance') }}
          </span>
        </AppButton>

        <NuxtLink
          v-if="!hasSufficientBalance"
          class="text-blue-500 hover:opacity-80 text-center"
          :to="JOIN_GUILD_LINK"
          target="_blank"
        >
          <p class="text-xs font-semibold mt-4">
            {{ $t('guild.createGuild.findAGuildToJoin') }}
          </p>
        </NuxtLink>
      </div>
    </div>
  </AppModal>
</template>
