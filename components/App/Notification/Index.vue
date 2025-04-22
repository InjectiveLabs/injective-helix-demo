<script lang="ts" setup>
import { NuxtUiIcons, NotificationType } from '@shared/types'
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
const progressBarInterval = ref()
const progressBarPercent = ref(100)
const remainingTimeout = ref(DEFAULT_NOTIFICATION_TIMEOUT)

const progressBarBg = computed(() => {
  const bgList = {
    [NotificationType.Error]: 'bg-red-500',
    [NotificationType.Warning]: 'bg-orange-400',
    [NotificationType.Success]: 'bg-green-400',
    [NotificationType.Info]: 'bg-primary-500'
  }

  return bgList[props.notification.type]
})

onMounted(() => {
  const timeout = props.notification.timeout || DEFAULT_NOTIFICATION_TIMEOUT

  notifTimeout.value = setTimeout(onClose, timeout)
  remainingTimeout.value = timeout
  setupProgressBar(timeout)
})

function onCopy() {
  copy(props.notification.context)
}

function onResume() {
  notifTimeout.value = setTimeout(onClose, remainingTimeout.value)
  setupProgressBar(remainingTimeout.value)
}

function onClose() {
  notificationStore.clear(props.notification.id)
  clearTimeout(notifTimeout.value)
}

function onPause() {
  clearTimeout(notifTimeout.value)
  clearInterval(progressBarInterval.value)

  remainingTimeout.value -= Date.now() - props.notification.id
}

function setupProgressBar(timeout: number) {
  const interval = 100
  const step = (interval / timeout) * 100

  progressBarInterval.value = setInterval(() => {
    progressBarPercent.value -= step

    if (progressBarPercent.value <= 0) {
      progressBarPercent.value = 0
      clearInterval(progressBarInterval.value)
    }
  }, interval)
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
            class="h-full w-full transition-all duration-[100ms]"
            :class="progressBarBg"
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
              class="text-xs text-gray-400 flex items-center leading-tight"
            >
              {{ notification.description }}
            </span>

            <AppTooltip
              v-if="notification.context"
              :content="notification.context"
            >
              <span
                class="text-xs text-[#A7C8FF] hover:text-[#A7C8FF]/80 transition-colors cursor-pointer"
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
                  class="text-xs text-[#A7C8FF] hover:text-[#A7C8FF]/80 transition-colors cursor-pointer"
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
