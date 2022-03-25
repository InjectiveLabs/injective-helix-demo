import { TransferDirection } from "../../domain/injective/transaction-types";

export class TransferHelper {
    getText(direction: TransferDirection) {
        if (direction === TransferDirection.TO_WALLET) {
            return 'Injective Wallet'
        } else {
            return 'Trading Account'
        }
    }
}