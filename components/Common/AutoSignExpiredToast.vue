<script lang="ts" setup>
import { NuxtUiIcons } from '@shared/types'
import { BusEvents, PortfolioSubPage } from '@/types'

const sharedWalletStore = useSharedWalletStore()

const isAutoSignExpiredToastVisible = ref(false)

function onClose() {
  isAutoSignExpiredToastVisible.value = false
}

function showAutoSignExpiredToast() {
  isAutoSignExpiredToastVisible.value = true

  setTimeout(() => {
    isAutoSignExpiredToastVisible.value = false
  }, 6 * 1000)
}

onMounted(() => {
  if (!sharedWalletStore.isAutoSignEnabled) {
    pause()
  }

  useEventBus(BusEvents.AutoSignConnected).on(() => resume())
})

const { pause, resume } = useIntervalFn(() => {
  if (!sharedWalletStore.isAutoSignEnabled) {
    pause()

    return
  }

  const nowInSeconds = Math.floor(Date.now() / 1000)
  const autoSignExpiration = sharedWalletStore.autoSign?.expiration || 0

  if (autoSignExpiration <= nowInSeconds) {
    showAutoSignExpiredToast()
    sharedWalletStore.disconnectAutoSign()
  }
}, 10 * 1000)
</script>

<template>
  <div
    class="z-[1110] fixed inset-0 flex flex-col gap-2 justify-end items-end p-6 pointer-events-none"
  >
    <Transition
      enter-active-class="ease-out duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="ease-in duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isAutoSignExpiredToastVisible"
        class="w-[400px] bg-coolGray-750 rounded-lg p-4 mb-2 pointer-events-auto"
      >
        <div class="flex justify-between">
          <div class="flex space-x-2">
            <UIcon
              :name="NuxtUiIcons.DashCircle"
              class="w-6 h-6 min-w-6 text-coolGray-350"
            />
            <div class="space-y-1">
              <div class="leading-4 text-white font-semibold text-sm">
                {{ $t('portfolio.settings.autoSign.expiredToast.title') }}
              </div>
              <i18n-t
                keypath="portfolio.settings.autoSign.expiredToast.description"
                tag="p"
                class="leading-4 text-coolGray-300 text-sm"
              >
                <template #settings>
                  <NuxtLink
                    class="text-blue-500 hover:opacity-80 hover:text-opacity-80 cursor-pointer"
                    :to="{ name: PortfolioSubPage.SettingsAutosign }"
                  >
                    {{
                      $t('portfolio.settings.autoSign.expiredToast.settings')
                    }}
                  </NuxtLink>
                </template>
              </i18n-t>
            </div>
          </div>

          <UIcon
            :name="NuxtUiIcons.Close"
            is-md
            class="cursor-pointer h-4 w-4 min-w-4"
            @click="onClose"
          />
        </div>
      </div>
    </Transition>
  </div>
</template>
