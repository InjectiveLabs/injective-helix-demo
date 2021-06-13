<template>
  <div class="mb-6 px-4">
    <ValidationObserver v-slot="{ invalid }" ref="form">
      <div class="flex flex-wrap -mx-4">
        <div class="w-full px-4">
          <ValidationProvider
            v-slot="{ errors, valid }"
            name="form.address"
            :rules="`required`"
          >
            <v-select-custom
              v-model="form.address"
              :errors="status.isLoading() ? [] : errors"
              :options="
                addresses.map((a) => ({
                  code: a,
                  label: a
                }))
              "
              :valid="valid"
              :label="$t('address')"
              :placeholder="$t('select_address_to_connect')"
              class="mt-2"
            >
            </v-select-custom>
          </ValidationProvider>
        </div>
        <div class="w-full px-4 mt-4">
          <v-ui-button
            :status="status"
            full
            :primary="!invalid"
            :ghost="invalid"
            :disabled="!form.address || invalid"
            @click.stop="onConnect"
          >
            {{ $t('connect') }}
          </v-ui-button>
        </div>
      </div>
    </ValidationObserver>
    <p v-if="status.isLoading()" class="text-gray-300 font-bold text-2xs mt-2">
      {{ $t('follow_instructions') }}
    </p>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Status } from '@injectivelabs/utils'
import { ValidationObserver, ValidationProvider } from 'vee-validate'
import { AccountAddress } from '@injectivelabs/ts-types'
import VSelectCustom from '~/components/inputs/select-custom.vue'

export default Vue.extend({
  components: {
    ValidationObserver,
    ValidationProvider,
    VSelectCustom
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
    addresses(): AccountAddress[] {
      return this.$accessor.wallet.addresses
    },

    $form(): InstanceType<typeof ValidationObserver> {
      return this.$refs.form as InstanceType<typeof ValidationObserver>
    }
  },

  methods: {
    onConnect() {
      this.status.setLoading()

      this.$accessor.wallet
        .confirm([this.form.address])
        .then(() => {
          //
        })
        .catch(this.$onRejected)
        .finally(() => {
          this.status.setIdle()
          this.$emit('connected')
        })
    }
  }
})
</script>
