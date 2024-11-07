<script lang="ts" setup>
import { Status, StatusType } from '@injectivelabs/utils'
import { NuxtUiIcons } from '@shared/types'
import { toBalanceInToken } from '@/app/utils/formatters'
import * as WalletTracker from '@/app/providers/mixpanel/WalletTracker'
import {
  GUILD_DISCORD_LINK,
  GUILD_BASE_TOKEN_SYMBOL
} from '@/app/utils/constants'
import { Modal } from '@/types'

const modalStore = useModalStore()
const walletStore = useWalletStore()
const sharedWalletStore = useSharedWalletStore()
const campaignStore = useCampaignStore()
const { t } = useLang()
const { validate, resetForm } = useForm()
const { $onError } = useNuxtApp()
const notificationStore = useSharedNotificationStore()

const NAME_MAX_CHARACTERS = 15
const DESCRIPTION_MAX_CHARACTERS = 255
const NAME_FIELD = 'guild-name'
const THUMBNAIL_FIELD = 'thumbnail'
const DESCRIPTION_FIELD = 'guild-description'
const GUILD_MIN_AMOUNT = 1000

const status = reactive(new Status(StatusType.Idle))

const { userBalancesWithToken } = useBalance()

const { value: name, errors: nameErrors } = useStringField({
  name: NAME_FIELD,
  rule: `required|maxCharacter:${NAME_MAX_CHARACTERS}`
})

const { value: description, errors: descriptionErrors } = useStringField({
  name: DESCRIPTION_FIELD,
  rule: `required|maxCharacter:${DESCRIPTION_MAX_CHARACTERS}`
})

const { value: thumbnail, errors: thumbnailErrors } = useStringField({
  name: THUMBNAIL_FIELD
})

const { valueToString: minAmountToString } = useSharedBigNumberFormatter(
  computed(() => GUILD_MIN_AMOUNT)
)

const { valueToString: balanceToString, valueToBigNumber: balanceToBigNumber } =
  useSharedBigNumberFormatter(
    computed(() => {
      const balance = userBalancesWithToken.value.find(
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
  balanceToBigNumber.value.gte(GUILD_MIN_AMOUNT)
)

const hasEmptyField = computed(() => !name.value || !thumbnail.value)

function disconnect() {
  walletStore.disconnect()
  WalletTracker.trackLogout()

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
      name: name.value,
      logo: thumbnail.value,
      description: description.value
    })
    .then(() => {
      notificationStore.success({
        title: t('guild.createGuild.toast')
      })
      onCloseModal()
    })
    .catch($onError)
    .finally(() => {
      status.setIdle()
    })
}

watch(
  () => modalStore.modals[Modal.CreateGuild],
  (isOpen: boolean) => {
    if (isOpen) {
      resetForm()
    }
  }
)
</script>

<template>
  <AppModal
    is-sm
    :ignore="['.v-popper__popper']"
    :is-open="modalStore.modals[Modal.CreateGuild]"
    @modal:closed="onCloseModal"
  >
    <template #title>
      <h2 class="text-xl font-semibold normal-case">
        {{ $t('guild.createGuild.title') }}
      </h2>
    </template>

    <div>
      <section>
        <div class="flex items-center justify-between text-xs mb-2">
          <span class="font-bold">
            {{ $t('guild.createGuild.name') }}
          </span>
          <span class="text-coolGray-450">
            {{ name?.length || 0 }} / {{ NAME_MAX_CHARACTERS }}
            {{ $t('guild.createGuild.characters') }}
          </span>
        </div>

        <AppInput
          v-model="name"
          is-sm
          wrapper-classes="p-2"
          :placeholder="$t('guild.createGuild.namePlaceholder')"
        />
        <p
          v-if="nameErrors[0]"
          class="text-red-500 first-letter:uppercase text-sm mt-1"
        >
          {{ nameErrors[0] }}
        </p>
      </section>

      <section class="mt-8">
        <div class="flex items-center justify-between text-xs mb-2">
          <span class="font-bold">
            {{ $t('guild.createGuild.masterAddress') }}
          </span>
          <span
            class="font-semibold text-blue-500 hover:text-opacity-80 cursor-pointer"
            @click="disconnect"
          >
            {{ $t('navigation.disconnect') }}
          </span>
        </div>
        <AppInput
          is-sm
          is-disabled
          :model-value="sharedWalletStore.injectiveAddress"
          wrapper-classes="p-2"
          :placeholder="$t('guild.createGuild.namePlaceholder')"
        />
      </section>

      <section class="mt-8">
        <div class="flex items-center justify-between text-xs mb-2">
          <span class="font-bold">
            {{ $t('guild.createGuild.description') }}
          </span>
          <span class="text-coolGray-450">
            {{ description?.length || 0 }} / {{ DESCRIPTION_MAX_CHARACTERS }}
          </span>
        </div>

        <AppTextarea v-model="description" />

        <p
          v-if="descriptionErrors[0]"
          class="text-red-500 first-letter:uppercase text-sm mt-1"
        >
          {{ descriptionErrors[0] }}
        </p>
      </section>

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
          <UIcon
            :name="NuxtUiIcons.Checkmark"
            class="text-green-500 w-4 h-4 min-w-4"
          />
          <UIcon
            :name="NuxtUiIcons.Warning"
            class="text-orange-400 w-4 h-4 min-w-4"
          />
        </div>
      </div>

      <p v-if="!hasSufficientBalance" class="text-coolGray-450 text-xs mt-2">
        {{
          $t('guild.createGuild.insufficientBalanceDescription', {
            amount: minAmountToString,
            symbol: GUILD_BASE_TOKEN_SYMBOL
          })
        }}
      </p>

      <div class="mt-8">
        <h3 class="text-xs font-semibold">
          {{ $t('guild.createGuild.thumbnail') }}
        </h3>

        <PartialsGuildThumbnailSelector v-model="thumbnail" />
        <p
          v-if="thumbnailErrors[0]"
          class="text-red-500 first-letter:uppercase text-sm mt-1"
        >
          {{ thumbnailErrors[0] }}
        </p>
      </div>

      <div class="mt-8">
        <AppButton
          class="w-full bg-blue-500 text-blue-900 font-semibold"
          size="lg"
          v-bind="{
            status,
            isDisabled: !hasSufficientBalance || hasEmptyField
          }"
          @click="onSubmit"
        >
          <span
            v-if="hasSufficientBalance"
            :class="{ 'text-coolGray-600': hasEmptyField }"
          >
            {{ $t('guild.createGuild.cta') }}
          </span>
          <span v-else class="text-coolGray-600">
            {{ $t('guild.createGuild.insufficientBalance') }}
          </span>
        </AppButton>

        <NuxtLink
          v-if="!hasSufficientBalance"
          class="text-blue-500 hover:opacity-80 text-center"
          :to="GUILD_DISCORD_LINK"
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
