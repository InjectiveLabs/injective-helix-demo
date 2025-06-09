<script lang="ts" setup>
import { NuxtUiIcons } from '@shared/types'
import { getExplorerUrl } from '@shared/utils/network'
import { DEFAULT_NOTIFICATION_TIMEOUT } from '@shared/utils/constant'
import { BusEvents } from '@/types'
import type { HelixCtaToast } from '@/types'
import type { Notification, NotificationAction } from '@shared/types'

const appStore = useAppStore()
const notificationStore = useSharedNotificationStore()
const { copy } = useClipboard()

const props = withDefaults(
  defineProps<{
    wrapperClass?: string
    contentClass?: string
    notification: Notification
  }>(),
  {
    wrapperClass: '',
    contentClass: 'text-white'
  }
)

const notifTimeout = ref()
const lastResumeTime = ref(0)
const hasCopied = ref(false)
const progressBarInterval = ref()
const progressBarPercent = ref(100)
const lastProgressBarPercent = ref(100)
const remainingTimeout = ref(DEFAULT_NOTIFICATION_TIMEOUT)

onMounted(() => {
  setupNotification()
})

watch(
  () => props.notification,
  () => {
    setupNotification()
  },
  { deep: true }
)

function setupNotification() {
  const timeout = props.notification.timeout || DEFAULT_NOTIFICATION_TIMEOUT

  lastResumeTime.value = Date.now()
  remainingTimeout.value = timeout

  notifTimeout.value = setTimeout(onClose, timeout)
  setupProgressBar(timeout)
}

function onCopy() {
  copy(props.notification.context)

  hasCopied.value = true

  setTimeout(() => {
    hasCopied.value = false
  }, 3000)
}

function onResume() {
  lastResumeTime.value = Date.now()
  lastProgressBarPercent.value = progressBarPercent.value

  notifTimeout.value = setTimeout(onClose, remainingTimeout.value)
  setupProgressBar(remainingTimeout.value)
}

function onClose() {
  notificationStore.clear(props.notification.id)

  useEventBus(BusEvents.NotificationClosed).emit(props.notification.key)

  clearTimeout(notifTimeout.value)
  clearInterval(progressBarInterval.value)

  if (props.notification.actions) {
    appStore.$patch({
      userState: {
        ...appStore.userState,
        dontShowAgain: [
          ...appStore.userState.dontShowAgain,
          props.notification.key as HelixCtaToast
        ]
      }
    })
  }
}

function onPause() {
  clearTimeout(notifTimeout.value)
  clearInterval(progressBarInterval.value)

  const elapsedTimeSinceLastResume = Date.now() - lastResumeTime.value
  remainingTimeout.value -= elapsedTimeSinceLastResume
}

function setupProgressBar(timeout: number) {
  const endTime = Date.now() + timeout

  clearInterval(progressBarInterval.value)

  progressBarInterval.value = setInterval(() => {
    const remainingDuration = Math.max(endTime - Date.now(), 0)

    progressBarPercent.value =
      (remainingDuration / timeout) * lastProgressBarPercent.value

    if (remainingDuration === 0) {
      clearInterval(progressBarInterval.value)
    }
  }, 100)
}

function onActionClick(action: NotificationAction) {
  if (action.callback) {
    action.callback()
  }

  onClose()
}
</script>

<template>
  <Transition
    enter-active-class="ease-out duration-300"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="ease-in duration-200"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="notification"
      :class="[
        notification.txHash || notification.isTelemetry
          ? 'w-[340px]'
          : 'max-w-[340px]',
        wrapperClass
      ]"
      class="rounded-lg overflow-hidden pointer-events-auto bg-brand-800 ml-4"
      @mouseenter="onPause"
      @mouseleave="onResume"
    >
      <div
        :class="{ 'pr-6': notification.isTelemetry }"
        class="relative flex gap-3 justify-between p-4 pt-5"
      >
        <div
          v-if="!notification.actions"
          class="absolute top-0 left-0 w-full h-1 [transform:rotateY(180deg)]"
        >
          <div
            class="h-full w-full transition-all duration-[100ms] bg-primary-500"
            :style="{ width: progressBarPercent + '%' }"
          />
        </div>

        <div class="flex flex-col gap-4" :class="contentClass">
          <div
            class="flex gap-3"
            :class="{ 'items-center': notification.isTelemetry }"
          >
            <div v-if="notification.isTelemetry" class="px-3">
              <span
                class="toast-loader block size-1 rounded-full animate-spin"
              />
            </div>

            <AppNotificationIcon
              v-else
              v-bind="{
                icon: notification.icon,
                notificationType: notification.type
              }"
            />

            <span class="text-sm font-semibold leading-tight h-auto my-auto">
              {{ notification.title }}
            </span>
          </div>

          <span
            v-if="notification.description || notification.timeElapsed"
            class="text-sm text-gray-400 leading-tight break-word"
          >
            {{ notification.description }}

            <i18n-t
              v-if="notification.txHash && notification.timeElapsed"
              tag="span"
              keypath="toast.transactionFinalized"
            >
              <template #duration>
                {{ notification.timeElapsed }}
              </template>

              <template #viewOnInjScan>
                <NuxtLink
                  v-if="notification.txHash"
                  target="_blank"
                  :to="`${getExplorerUrl()}/transaction/${notification.txHash}`"
                  class="text-sm text-blue-500 underline hover:opacity-80 transition-opacity"
                >
                  {{ $t('toast.viewOnInjScan') }}
                </NuxtLink>
              </template>
            </i18n-t>
          </span>

          <AppTooltip
            v-if="notification.context"
            :content="notification.context"
          >
            <span
              class="text-sm font-semibold text-[#A7C8FF] hover:text-[#A7C8FF]/80 transition-colors cursor-pointer"
              @click="onCopy"
            >
              {{
                hasCopied
                  ? $t('toast.contextCopied')
                  : $t('common.showMoreContext')
              }}
            </span>
          </AppTooltip>

          <div
            v-if="notification.actions"
            class="flex items-center gap-3 flex-wrap"
          >
            <AppNotificationButton
              v-for="(action, index) in notification.actions"
              :key="index"
              v-bind="{ action }"
              @on:click="onActionClick"
            />
          </div>
        </div>

        <slot
          v-if="!notification.isTelemetry"
          name="close"
          :close-notification="onClose"
        >
          <UIcon
            :name="NuxtUiIcons.Close"
            class="text-white size-5 min-w-5 hover:text-gray-400 transition-colors"
            @click="onClose"
          />
        </slot>
      </div>
    </div>
  </Transition>
</template>

<style>
.toast-loader {
  animation-duration: 1.2s;
  box-shadow:
    10.2px 0px 0 0 #94a3b8,
    6.3px 8px 0 0 #94a3b8,
    -2.2px 9.9px 0 0 #94a3b8,
    -9.2px 4.4px 0 0 #94a3b8,
    -9.2px -4.4px 0 0 #94a3b8,
    -2.2px -9.9px 0 0 #94a3b8,
    6.3px -8px 0 0 #94a3b8;
}
</style>
