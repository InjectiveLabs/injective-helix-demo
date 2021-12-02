import {
  ApolloClient,
  InMemoryCache,
  NormalizedCacheObject,
  ApolloQueryResult
} from '@apollo/client/core'
import { USER_DEPOSITS } from './queries'
import { UserDepositResponse } from '~/types/gql'

export class ApolloConsumer {
  private apolloClient: ApolloClient<NormalizedCacheObject>

  constructor(graphQlEndpoint: string) {
    this.apolloClient = new ApolloClient({
      uri: graphQlEndpoint,
      cache: new InMemoryCache(),
      defaultOptions: {
        query: {
          fetchPolicy: 'no-cache',
          errorPolicy: 'all'
        }
      }
    })
  }

  async fetchUserDeposits(address: string) {
    const response = (await this.apolloClient.query({
      query: USER_DEPOSITS,
      variables: { sender: address.toLowerCase() }
    })) as ApolloQueryResult<UserDepositResponse>

    if (response.errors && response.errors.length > 0) {
      throw new Error(response.errors[0].message)
    }

    return response.data.deposits
  }
}
