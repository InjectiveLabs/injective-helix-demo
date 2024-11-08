import { defineStore } from 'pinia'
import { msgBroadcaster } from '@shared/WalletService'
import {
  MsgGrant,
  MsgRevoke,
  getGenericAuthorizationFromMessageType,
  GrantAuthorizationWithDecodedAuthorization
} from '@injectivelabs/sdk-ts'
import { MsgType } from '@injectivelabs/ts-types'
import { authZApi } from '@/app/Services'
import { backupPromiseCall } from '@/app/utils/async'

type AuthZStoreState = {
  granterGrants: GrantAuthorizationWithDecodedAuthorization[]
  granteeGrants: GrantAuthorizationWithDecodedAuthorization[]
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
          {} as Record<string, GrantAuthorizationWithDecodedAuthorization[]>
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
          {} as Record<string, GrantAuthorizationWithDecodedAuthorization[]>
        )
      ),

    hasAuthZPermission: (state) => (messageType: MsgType) => {
      const sharedWalletStore = useSharedWalletStore()

      const msg = messageType.startsWith('/') ? messageType : `/${messageType}`

      return state.granteeGrants.some(
        (grant) =>
          grant.granter === sharedWalletStore.authZ.injectiveAddress &&
          grant.authorization?.msg === msg
      )
    }
  },
  actions: {
    async fetchGrants() {
      const authZStore = useAuthZStore()
      const sharedWalletStore = useSharedWalletStore()

      if (
        !sharedWalletStore.isUserConnected ||
        !sharedWalletStore.injectiveAddress
      ) {
        return
      }

      const pagination = { limit: 1000 }

      const [{ grants: granteeGrants }, { grants: granterGrants }] =
        await Promise.all([
          authZApi.fetchGranteeGrants(
            sharedWalletStore.injectiveAddress,
            pagination
          ),
          authZApi.fetchGranterGrants(
            sharedWalletStore.injectiveAddress,
            pagination
          )
        ])

      authZStore.$patch({
        granterGrants:
          granterGrants as GrantAuthorizationWithDecodedAuthorization[],
        granteeGrants:
          granteeGrants as GrantAuthorizationWithDecodedAuthorization[]
      })
    },

    async grantAuthorization({
      grantee,
      messageTypes
    }: {
      grantee: string
      messageTypes: string[]
    }) {
      const authZStore = useAuthZStore()
      const walletStore = useWalletStore()
      const sharedWalletStore = useSharedWalletStore()

      if (!sharedWalletStore.isUserConnected) {
        return
      }

      await walletStore.validate()

      const msgs = messageTypes.map((messageType) =>
        MsgGrant.fromJSON({
          grantee,
          authorization: getGenericAuthorizationFromMessageType(messageType),
          granter: sharedWalletStore.injectiveAddress
        })
      )

      await msgBroadcaster.broadcastWithFeeDelegation({
        msgs,
        injectiveAddress: sharedWalletStore.injectiveAddress
      })

      await backupPromiseCall(() => authZStore.fetchGrants())
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
      const sharedWalletStore = useSharedWalletStore()

      if (!sharedWalletStore.isUserConnected) {
        return
      }

      await walletStore.validate()

      const msgs = messageTypes.map((messageType) =>
        MsgRevoke.fromJSON({
          grantee,
          messageType,
          granter: sharedWalletStore.injectiveAddress
        })
      )

      await msgBroadcaster.broadcastWithFeeDelegation({
        msgs,
        injectiveAddress: sharedWalletStore.injectiveAddress
      })

      await backupPromiseCall(() => authZStore.fetchGrants())
    }
  }
})
