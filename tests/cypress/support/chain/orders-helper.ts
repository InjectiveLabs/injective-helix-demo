import { Network } from '@injectivelabs/networks'
import { DerivativeMarketConsumer } from '@injectivelabs/derivatives-consumer'
import { getUrlEndpointForNetwork, UrlEndpoint } from '@injectivelabs/networks'
import { AddressHelper, EthereumAddress } from '../helpers/address-helper'
import { DerivativeLimitOrder } from '@injectivelabs/exchange-api/injective_derivative_exchange_rpc_pb';

export class OrdersHelper {
    private endpoint: UrlEndpoint
    private addressHelper = new AddressHelper()

    constructor(readonly network: Network) {
        this.network = network
        this.endpoint = getUrlEndpointForNetwork(network)
    }

    async getDerivativeOrders(walletAddress: EthereumAddress) {
        let client = new DerivativeMarketConsumer(this.endpoint.exchangeApi)
        return new Cypress.Promise(re => {
            client.fetchOrders({ subaccountId: this.addressHelper.toSubaccountAddress(walletAddress).value })
            .then(r => {
                console.log('sdasdad')
                re(r)
            }).catch(err => {
                throw err
            })
        // })
        .then(r => {
            console.log('puaaaa')
        })
        })
    }
}