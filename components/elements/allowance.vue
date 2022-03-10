<template>
  <div class="w-full xs:w-1/2 font-bold mx-auto">
    <p class="mb-4">
      {{ $t('bridge.setAllowanceFor', { asset: tokenWithBalance.symbol }) }}
    </p>
    <v-button
      lg
      primary
      :status="status"
      class="w-full"
      @click.stop="handleClickOnSetAllowance"
    >
      {{ $t('bridge.setAllowance') }}
    </v-button>
  </div>
</template>

<script lang="ts">
import { Status } from '@injectivelabs/utils'
import Vue, { PropType } from 'vue'
import { TokenWithBalance } from '@injectivelabs/ui-common'

export default Vue.extend({
  props: {
    tokenWithBalance: {
      required: true,
      type: Object as PropType<TokenWithBalance>
    }
  },

  data() {
    return {
      status: new Status()
    }
  },

  methods: {
    handleClickOnSetAllowance() {
      const { tokenWithBalance } = this

      this.status.setLoading()

      this.$accessor.token
        .setTokenAllowance(tokenWithBalance)
        .then(() => {
          this.$emit('unlocked')
          this.$toast.success(this.$t('bridge.successfullySetAllowance'))
        })
        .catch(this.$onError)
        .finally(() => {
          this.status.setIdle()
        })
    }
  }
})
</script>
