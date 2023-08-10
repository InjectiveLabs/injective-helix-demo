import { defineStore } from 'pinia'
import { authZApi } from 'app/Services'
import { GrantAuthorization } from '@/types/authZ'

type AuthZStoreState = {
  granterGrants: GrantAuthorization[]
  granteeGrants: GrantAuthorization[]
}

const initialStateFactory = (): AuthZStoreState => ({
  granterGrants: [],
  granteeGrants: []
})

export const useAuthZStore = defineStore('authZ', {
  state: (): AuthZStoreState => initialStateFactory(),
  getters: {
    hasGranteeGrants: (state: AuthZStoreState) => {
      return state.granteeGrants.length > 0
    },

    hasGranterGrants: (state: AuthZStoreState) => {
      return state.granterGrants.length > 0
    },

    grantersOrGrantees: (state: AuthZStoreState) => {
      return [
        ...new Set([
          ...state.granteeGrants.map((grant) => grant.granter),
          ...state.granterGrants.map((grant) => grant.grantee)
        ])
      ]
    }
  },
  actions: {
    async fetchGrants() {
      const authZStore = useAuthZStore()
      const walletStore = useWalletStore()

      if (!walletStore.isUserWalletConnected || !walletStore.injectiveAddress) {
        return
      }

      const { grants: granteeGrants } = await authZApi.fetchGranteeGrants(
        walletStore.injectiveAddress
      )
      const { grants: granterGrants } = await authZApi.fetchGranterGrants(
        walletStore.injectiveAddress
      )

      authZStore.$patch({
        granterGrants: granterGrants as GrantAuthorization[],
        granteeGrants: granteeGrants as GrantAuthorization[]
      })
    }
  }
})
