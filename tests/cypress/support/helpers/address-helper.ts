import { add } from "cypress/types/lodash";
import { Address, Network } from "../../domain/injective/blockchain";

export type EthereumAddress = Address

export class AddressHelper {
    readonly addressSufix = "000000000000000000000000"

    obfuscateAddress(address: Address): Address {
        return new Address(address.value.slice(0, 6) + '...' + address.value.slice(-6), address.network)
    }

    obfuscateSubaccountAddress(address: EthereumAddress): Address {
        let subaccountAddress = this.toSubaccountAddress(address).value
        return new Address(subaccountAddress.slice(0, 6) + '...' + subaccountAddress.slice(-6), address.network)
    }

    toSubaccountAddress(address: EthereumAddress): Address {
        return new Address(address.value + this.addressSufix, address.network)
    }
}

export class NetworkHelper {
    getNetwork(address: string): Network {
        if (address.toLowerCase().indexOf('0x') > -1) {
            return Network.ETHEREUM
        }

        return Network.INJECTIVE_CHAIN
    }
}