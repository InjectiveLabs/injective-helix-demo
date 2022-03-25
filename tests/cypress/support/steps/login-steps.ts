import HeaderPart from "../../pages/injective/exchange/header-part"

let headerPart = new HeaderPart()

export function assertWalletIsConnected(expectedWalletAddress: string) {
    headerPart.assertWalletIsConnected(expectedWalletAddress)
}