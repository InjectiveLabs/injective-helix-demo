<script lang="ts" setup>
import { isSgtSubaccountId } from '@/app/utils/helpers'
import { ActivitySubPage } from '@/types'

const router = useRouter()
const appStore = useAppStore()

function onUpdateSubaccount(subaccountId: string) {
  if (isSgtSubaccountId(subaccountId)) {
    router.replace({ name: ActivitySubPage.Spot })
  }
}
</script>

<template>
  <div class="flex items-center py-4">
    <h1 class="text-3xl font-semibold mr-4 my-2">
      {{ $t('activity.activity') }}
    </h1>

    <PartialsActivitySubaccountsSelector
      v-if="appStore.isSubaccountManagementActive"
      @update:subaccount="onUpdateSubaccount"
    />
  </div>
</template>
