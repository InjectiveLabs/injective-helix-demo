import { defineStore } from 'pinia'
import { msgBroadcaster } from '@shared/WalletService'
import { MsgGrant, MsgRevoke } from '@injectivelabs/sdk-ts'
import { authZApi } from '@/app/Services'
import { GrantAuthorization } from '@/types/authZ'
import { backupPromiseCall } from '@/app/utils/async'

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

    granterGrantsByAddress: (state) =>
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
      ),

    granteeGrantsByAddress: (state) =>
      Object.entries(
        state.granteeGrants.reduce(
          (addressMap, grant) => {
            const address = grant.granter
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
      const appStore = useAppStore()
      const walletStore = useWalletStore()

      if (!walletStore.injectiveAddress) {
        return
      }

      await appStore.queue()
      await walletStore.validate()

      const msgs = messageTypes.map((messageType) =>
        MsgGrant.fromJSON({
          messageType: `/${messageType}`,
          grantee,
          granter: walletStore.injectiveAddress
        })
      )

      const response = await msgBroadcaster.broadcastWithFeeDelegation({
        msgs: [...(msgs as any)],
        injectiveAddress: walletStore.injectiveAddress
      })

      return response
    },

    async revokeAuthorization({
      grantee,
      messageTypes
    }: {
      grantee: string
      messageTypes: string[]
    }) {
      const authZStore = useAuthZStore()
      const walletStore = useWalletStore()

      if (!walletStore.injectiveAddress) {
        return
      }

      const msgs = messageTypes.map((messageType) =>
        MsgRevoke.fromJSON({
          messageType: `/${messageType}`,
          grantee,
          granter: walletStore.injectiveAddress
        })
      )

      const response = await msgBroadcaster.broadcastWithFeeDelegation({
        msgs,
        injectiveAddress: walletStore.injectiveAddress
      })

      backupPromiseCall(() => authZStore.fetchGrants())

      return response
    }
  }
})
