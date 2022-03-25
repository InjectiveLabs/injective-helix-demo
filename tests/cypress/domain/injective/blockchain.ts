export enum Network {
    INJECTIVE_CHAIN,
    ETHEREUM
}

export class Address {
    constructor(readonly value: string, readonly network: Network) {
        this.value = value
        this.network = network
    }
}