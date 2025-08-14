import { defineStore } from 'pinia'
import { faucetService } from '@shared/Service'
import { sharedBackupPromiseCall } from '@shared/utils/async'
import {
  MsgGrant,
  MsgRevoke,
  getGenericAuthorizationFromMessageType
} from '@injectivelabs/sdk-ts'
import { authZApi } from '@/app/Services'
import type { MsgType } from '@injectivelabs/ts-types'
import type { GrantAuthorizationWithDecodedAuthorization } from '@injectivelabs/sdk-ts'

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
      const accountStore = useAccountStore()
      const sharedWalletStore = useSharedWalletStore()

      if (!sharedWalletStore.isUserConnected) {
        return
      }

      await walletStore.validate()

      if (!accountStore.hasBalance) {
        try {
          await faucetService.fundInjectiveAddress(
            sharedWalletStore.injectiveAddress
          )
        } catch {
          // silently throw error
        }
      }

      const messages = messageTypes.map((messageType) =>
        MsgGrant.fromJSON({
          grantee,
          authorization: getGenericAuthorizationFromMessageType(messageType),
          granter: sharedWalletStore.injectiveAddress
        })
      )

      await sharedWalletStore.broadcastWithFeeDelegation({
        messages
      })

      await sharedBackupPromiseCall(() => authZStore.fetchGrants())
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

      const messages = messageTypes.map((messageType) =>
        MsgRevoke.fromJSON({
          grantee,
          messageType,
          granter: sharedWalletStore.injectiveAddress
        })
      )

      await sharedWalletStore.broadcastWithFeeDelegation({
        messages
      })

      await sharedBackupPromiseCall(() => authZStore.fetchGrants())
    }
  }
})
