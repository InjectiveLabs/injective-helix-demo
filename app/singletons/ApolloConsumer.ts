import { ApolloConsumer } from '../gql/client'
import { PEGGY_GRAPH_URL } from '../utils/constants'

export const apolloConsumer = new ApolloConsumer(PEGGY_GRAPH_URL)
