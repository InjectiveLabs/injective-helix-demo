<template>
  <div class="w-full text-center">
    <p class="text-sm text-gray-200">
      {{
        $t(`Set allowance for ${tokenWithBalance.symbol}`, {
          asset: tokenWithBalance.symbol
        })
      }}
    </p>
    <div class="w-full mt-6 md:w-2/3 md:mx-auto lg:w-full 2xl:w-2/3">
      <v-button
        lg
        primary
        :status="status"
        class="w-full"
        @click.stop="handleClickOnSetAllowance"
      >
        {{ $t('Set Allowance') }}
      </v-button>
    </div>
  </div>
</template>

<script lang="ts">
import { Status } from '@injectivelabs/utils'
import Vue, { PropType } from 'vue'
import { TokenWithBalance } from '~/types/token'

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
          this.$toast.success(this.$t('Token allowance set successfully'))
        })
        .catch(this.$onError)
        .finally(() => {
          this.status.setIdle()
        })
    }
  }
})
</script>
