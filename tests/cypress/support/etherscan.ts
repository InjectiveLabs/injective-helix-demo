import { promisify } from 'util'
import { init } from 'etherscan-api'
import Helpers from './helpers'

let sleep = promisify(setTimeout)
let retries = 0;

interface TransactionData {
    txStatus: TransactionStatus
    txReceipt: TransactionReceipt
}

interface TransactionStatus {
    result: TransactionStatusResult
}

interface TransactionStatusResult {
    isError: string
}

interface TransactionReceipt {
    result: TransactionResult
}

interface TransactionResult {
    status: String    
}

export default class Etherscan {

private helpers: Helpers = new Helpers()

    async getTransactionStatus(txId: string): Promise<TransactionData> {
        const currentNetwork = this.helpers.getNetwork().networkName;
        const etherscanApi = init(
            process.env.ETHERSCAN_KEY,
            currentNetwork,
            30000,
        );
        const txStatus = await etherscanApi.transaction.getstatus(txId);
        const txReceipt = await etherscanApi.proxy.eth_getTransactionReceipt(txId);
        return { txStatus, txReceipt };
    }

    async waitForTxSuccess(txId: string): Promise<TransactionData> {
        const txStatus = await this.getTransactionStatus(txId);
        if (
            // status success
            txStatus.txReceipt.result &&
            txStatus.txReceipt.result.status === '0x1' &&
            txStatus.txStatus.result &&
            txStatus.txStatus.result.isError === '0'
        ) {
            console.log(`Transaction ${txId} has been confirmed with success, moving on...`,);
            retries = 0;

            return txStatus
        } else if (
            // status pending
            txStatus.txReceipt.result === null &&
            txStatus.txStatus.result.isError === '0' &&
            retries <= 24 // 120 sec
        ) {
            console.log(`Transaction ${txId} is still pending.. waiting..`);
            retries++;
            await sleep(5000);
            const result = await this.waitForTxSuccess(txId);
            return result;
        } else {
            retries = 0;
            throw new Error(
            `Transaction ${txId} has failed or it hasn't been approved until timer ran out. Check Etherscan for more details.`,
            );
        }
    }
}