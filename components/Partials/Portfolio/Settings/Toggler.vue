<script setup lang="ts">
import { NuxtUiIcons } from '@shared/types'
import { Status, StatusType } from '@injectivelabs/utils'
import { TRADING_MESSAGES } from '@/app/data/trade'
import { BusEvents, SettingsPreferences } from '@/types'

const appStore = useAppStore()
const sharedWalletStore = useSharedWalletStore()
const notificationStore = useSharedNotificationStore()
const { t } = useLang()
const { $onError } = useNuxtApp()
const { lg } = useSharedBreakpoints()

const status = reactive(new Status(StatusType.Idle))

const props = withDefaults(
  defineProps<{
    title: string
    description?: string
    tooltipText?: string
    tooltipLink?: string
    isDisabled?: boolean
    type: SettingsPreferences
  }>(),
  { description: '', tooltipText: '', tooltipLink: '' }
)

const getValue = computed(() => {
  const valueList = {
    [SettingsPreferences.Eip712]: sharedWalletStore.isEip712,
    [SettingsPreferences.AutoSign]: sharedWalletStore.isAutoSignEnabled,
    [SettingsPreferences.ThousandsSeparators]:
      appStore.userState.preferences.thousandsSeparator,
    [SettingsPreferences.GridTradingSubaccounts]:
      appStore.userState.preferences.showGridTradingSubaccounts
  }

  return valueList[props.type] !== undefined ? valueList[props.type] : false
})

const switchValue = computed({
  get: () => getValue.value,
  set: (value) => handleSwitchValueChange(value)
})

function handleSwitchValueChange(value: any) {
  if (props.isDisabled) {
    return
  }

  if (props.type === SettingsPreferences.ThousandsSeparators) {
    appStore.setUserState({
      ...appStore.userState,
      preferences: {
        ...appStore.userState.preferences,
        thousandsSeparator: value
      }
    })
  } else if (props.type === SettingsPreferences.GridTradingSubaccounts) {
    appStore.setUserState({
      ...appStore.userState,
      preferences: {
        ...appStore.userState.preferences,
        showGridTradingSubaccounts: value
      }
    })
  } else if (props.type === SettingsPreferences.Eip712) {
    sharedWalletStore.$patch({ isEip712: value })
  } else if (props.type === SettingsPreferences.AutoSign) {
    if (value) {
      connectAutoSign()

      return
    }

    disconnectAutoSign()
  }
}

function connectAutoSign() {
  status.setLoading()

  sharedWalletStore
    .connectAutoSign(
      TRADING_MESSAGES
      // CONTRACT_EXECUTION_COMPAT_AUTHZ // TODO: Add this when we have authz contract exec support
    )
    .then(() => {
      useEventBus(BusEvents.AutoSignConnected).emit()

      notificationStore.update({
        title: t('toast.portfolio.autoSign.enabledToast.title'),
        description: t('toast.portfolio.autoSign.enabledToast.description')
      })
    })
    .catch($onError)
    .finally(() => status.setIdle())
}

function disconnectAutoSign() {
  status.setLoading()

  sharedWalletStore
    .disconnectAutoSign()
    .then(() => {
      notificationStore.success({
        title: t('toast.portfolio.autoSign.disabledToast')
      })
    })
    .catch($onError)
    .finally(() => status.setIdle())
}
</script>

<template>
  <div class="p-4 sm:pr-6 flex justify-between items-center gap-4 border-b">
    <div class="flex-1">
      <div class="flex items-center gap-1.5">
        <h4 class="text-sm font-medium text-white">
          {{ title }}
        </h4>

        <UPopover
          v-if="tooltipText"
          :popper="{ placement: 'top' }"
          :mode="lg ? 'hover' : 'click'"
        >
          <UIcon :name="NuxtUiIcons.Info3" class="size-4" />

          <template #panel>
            <div
              class="flex flex-col gap-2 text-xs text-coolGray-200 max-w-72 p-2 rounded bg-[#2D3135] tracking-wide"
            >
              <p>{{ tooltipText }}</p>

              <NuxtLink
                v-if="tooltipLink"
                :to="tooltipLink"
                target="_blank"
                class="text-blue-300 hover:opacity-70 transition-opacity"
              >
                {{ $t('common.learnMore') }}
              </NuxtLink>
            </div>
          </template>
        </UPopover>
      </div>

      <p v-if="description" class="text-xs text-coolGray-350 mt-2">
        {{ description }}
      </p>
    </div>

    <AppSwitch v-model="switchValue" v-bind="{ isDisabled }" />
  </div>
</template>
