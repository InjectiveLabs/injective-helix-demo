import { defineStore } from 'pinia'
import { MsgGrant } from '@injectivelabs/sdk-ts'
import { GeneralException } from '@injectivelabs/exceptions'
import { authZApi, msgBroadcastClient } from '@/app/Services'
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

    hasGranterOrGranteeGrants: (state: AuthZStoreState) => {
      return state.granterGrants.length > 0 || state.granteeGrants.length > 0
    },

    grantersOrGranteesAddresses: (state: AuthZStoreState) => {
      return [
        ...new Set([
          ...state.granteeGrants.map((grant) => grant.granter),
          ...state.granterGrants.map((grant) => grant.grantee)
        ])
      ]
    },

    grantsByAddress: (state) =>
      Object.entries(
        state.granterGrants.reduce(
          (addressMap, grant) => {
            const address = grant.grantee
            const grants = addressMap[address] || []
            grants.push(grant)
            addressMap[address] = grants
            return addressMap
          },
          {} as Record<string, GrantAuthorization[]>
        )
      )
  },
  actions: {
    async fetchGrants() {
      const authZStore = useAuthZStore()
      const walletStore = useWalletStore()

      if (!walletStore.isUserWalletConnected) {
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
    },

    async grantAuthorization({
      grantee,
      messageTypes
    }: {
      grantee: string
      messageTypes: string[]
    }) {
      const walletStore = useWalletStore()

      if (!walletStore.isUserWalletConnected) {
        return
      }

      if (walletStore.isAuthzWalletConnected) {
        throw new GeneralException(
          new Error('AuthZ not supported for this action')
        )
      }

      const msgs = messageTypes.map((messageType) =>
        MsgGrant.fromJSON({
          messageType,
          grantee,
          granter: walletStore.injectiveAddress
        })
      )

      const response = await msgBroadcastClient.broadcastWithFeeDelegation({
        msgs,
        injectiveAddress: walletStore.injectiveAddress
      })

      return response
    }
  }
})
