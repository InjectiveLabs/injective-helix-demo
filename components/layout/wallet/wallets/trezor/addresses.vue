<template>
  <div class="mt-4 border-b border-gray-600">
    <div class="flex flex-wrap -mx-4">
      <div class="w-full px-4 mb-2 text-left">
        <div v-if="status.isNotLoading()">
          <VButton sm @click.stop.prevent="handleClickOnFetchAddresses">
            <div
              class="-mx-2 mt-2 flex items-center font-semibold text-primary-500 hover:text-primary-400"
            >
              <span class="mr-2">{{
                addresses.length === 0
                  ? $t('connect.getAddresses')
                  : $t('connect.getMoreAddresses')
              }}</span>
              <IconArrow class="transform rotate-180 w-3 h-3" />
            </div>
          </VButton>
        </div>
        <p v-else class="text-gray-400 text-xs my-2">
          {{ $t('connect.getAddressNote') }}
        </p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Status } from '@injectivelabs/utils'
import { Wallet } from '@injectivelabs/ts-types'

export default Vue.extend({
  components: {
    //
  },

  data() {
    return {
      status: new Status(),
      form: {
        address: ''
      }
    }
  },

  computed: {
    addresses(): string[] {
      return this.$accessor.wallet.addresses
    }
  },

  watch: {
    'form.path'() {
      this.$accessor.wallet.setAddresses([])
    }
  },

  methods: {
    handleClickOnFetchAddresses() {
      this.status.setLoading()

      this.$accessor.wallet
        .getHWAddresses(Wallet.Trezor)
        .then(() => {
          //
        })
        .catch(this.$onError)
        .finally(() => {
          this.status.setIdle()
        })
    }
  }
})
</script>
