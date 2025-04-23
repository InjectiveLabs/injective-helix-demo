<script lang="ts" setup>
import { NuxtUiIcons } from '@shared/types'
import { DEFAULT_NOTIFICATION_TIMEOUT } from '@shared/utils/constant'
import type { Notification } from '@shared/types'

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
const progressBarInterval = ref()
const progressBarPercent = ref(100)
const lastProgressBarPercent = ref(100)
const remainingTimeout = ref(DEFAULT_NOTIFICATION_TIMEOUT)

onMounted(() => {
  const timeout = props.notification.timeout || DEFAULT_NOTIFICATION_TIMEOUT

  lastResumeTime.value = Date.now()
  remainingTimeout.value = timeout

  notifTimeout.value = setTimeout(onClose, timeout)
  setupProgressBar(timeout)
})

function onCopy() {
  copy(props.notification.context)
}

function onResume() {
  lastResumeTime.value = Date.now()
  lastProgressBarPercent.value = progressBarPercent.value

  notifTimeout.value = setTimeout(onClose, remainingTimeout.value)
  setupProgressBar(remainingTimeout.value)
}

function onClose() {
  notificationStore.clear(props.notification.id)

  clearTimeout(notifTimeout.value)
  clearInterval(progressBarInterval.value)
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
      class="rounded-lg overflow-hidden pointer-events-auto bg-brand-800"
      :class="wrapperClass"
      @mouseenter="onPause"
      @mouseleave="onResume"
    >
      <div
        class="relative flex gap-4 justify-between p-4 pt-5"
        :class="{ 'items-center': !notification.description }"
      >
        <div class="absolute top-0 left-0 w-full h-1">
          <div
            class="h-full w-full transition-all duration-[100ms] bg-primary-500"
            :style="{ width: progressBarPercent + '%' }"
          />
        </div>

        <div
          class="flex gap-4"
          :class="{ 'items-center': !notification.description }"
        >
          <AppNotificationIcon
            v-bind="{ notificationType: notification.type }"
          />

          <div class="flex flex-col gap-3" :class="contentClass">
            <span class="text-sm font-semibold leading-tight">
              {{ notification.title }}
            </span>

            <span
              v-if="notification.description"
              class="text-sm text-gray-400 flex items-center leading-tight"
            >
              {{ notification.description }}
            </span>

            <AppTooltip
              v-if="notification.context"
              :content="notification.context"
            >
              <span
                class="text-sm font-semibold text-[#A7C8FF] hover:text-[#A7C8FF]/80 transition-colors cursor-pointer"
                @click="onCopy"
              >
                {{ $t('common.showMoreContext') }}
              </span>
            </AppTooltip>

            <div v-if="notification.actions" class="flex gap-3">
              <button
                v-for="(action, index) in notification.actions"
                :key="index"
                @click="() => action.callback()"
              >
                <span
                  class="text-sm font-semibold text-[#A7C8FF] hover:text-[#A7C8FF]/80 transition-colors cursor-pointer"
                  :class="action.class"
                >
                  {{ action.label }}
                </span>
              </button>
            </div>
          </div>
        </div>

        <slot name="close" :close-notification="onClose">
          <UIcon
            :name="NuxtUiIcons.Close"
            class="text-white size-4"
            @click="onClose"
          />
        </slot>
      </div>
    </div>
  </Transition>
</template>
