<script setup lang="ts">
// todo: remove this
const address = ref('inj1ecs4my7etjjt6e3c9hncfc9rljlg2v5wuua5rc')

const walletStore = useWalletStore()

function setAuthzAddress() {
  walletStore.connectAuthZ(address.value)
}
</script>

<template>
  <div class="p-4 flex gap-2">
    <input v-model="address" class="input p-2" />
    <AppButton class="whitespace-nowrap" @click="setAuthzAddress">
      Set Authz Address
    </AppButton>
    <AppButton class="whitespace-nowrap" @click="walletStore.resetAuthZ()">
      Reset AuthZ
    </AppButton>
  </div>
</template>
