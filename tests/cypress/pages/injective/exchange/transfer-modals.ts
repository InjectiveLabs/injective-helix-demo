import Amount from "../../../domain/injective/amount";
import { AssetFactory, Coin, USD } from "../../../domain/injective/assets";
import { Network } from "../../../domain/injective/blockchain";

export enum TransferDirection{ TO_TRADING_ACCOUNT, TO_WALLET }

export class PrepareTransferModal{
    readonly fromCy = 'transfer-from'
    readonly toCy = 'transfer-to'
    readonly availableCy = 'transfer-available'
    readonly amountInputCy = 'token-selector-amount'
    readonly transferNowButtonCy = 'bridge-transfer-now-button'
    readonly maxButtonCy = 'max-button'
    readonly selectedTokenCy = 'token-selector-selected'
    readonly directionToggleCy = 'transfer-direction-toggle'

    fetchFrom() {
        cy.getByDataCy(this.fromCy).invoke('text').as('transferFrom')
    }

    fetchTo() {
        cy.getByDataCy(this.toCy).invoke('text').as('transferTo')
    }

    fetchAvailable() {
        cy.getByDataCy(this.availableCy).invoke('text').then((text: string) => {
            let coin = AssetFactory.fromText(text.onlyLetters())
            return new Amount(coin, text.onlyNumbers())
        }).as('bridgeAvailable')
    }

    getDropDownAvailable(coin: Coin): Amount {
        return null
    }

    getErrorMessage(): string {
        return null
    }

    clickSwitchDirection() {
        cy.getByDataCy(this.directionToggleCy).click()
    }

    clickMax() {
        cy.getByDataCy(this.maxButtonCy).click()
    }

    enterValue(value: string) {
        cy.getByDataCy(this.amountInputCy).type(value)
    }

    fetchValue() {
        cy.getByDataCy(this.selectedTokenCy).invoke('text').then((t: unknown) => {
            cy.getByDataCy(this.amountInputCy).invoke('val').then((v: unknown) => {
                return new Amount(AssetFactory.fromText((t as string).trim()), v as string)
            }).as('transferValue')
        })
    }

    fetchSelectedToken() {
        cy.getByDataCy(this.selectedTokenCy).invoke('text').then((t: unknown) => {
            return (t as string).trim()
        })
        .as('transferToken')
    }

    selectCoin(coin: Coin): PrepareTransferModal {
        return null
    }

    searchForCoin(coin: Coin): PrepareTransferModal {
        return null
    }

    clickTransferNow() {
        cy.getByDataCy(this.transferNowButtonCy).click()
    }
}

export class ConfirmTransferModal {
    readonly modalCy = 'bridge-modal'
    readonly valueCy = 'bridge-confirm-value'
    readonly valueUsdCy = 'bridge-confirm-value-usd'
    readonly fromCy = 'bridge-confirm-from'
    readonly toCy = 'bridge-confirm-to'
    readonly confirmButtonCy = 'bridge-confirm-button'
    readonly closeButtonCy = 'modal-close-button'

    fetchValue() {
        cy.getByDataCy(this.valueCy).invoke('text').then((text: unknown) => {
            return new Amount(AssetFactory.fromText((text as string).onlyLetters()), (text as string).onlyNumbers())
        }).as('confirmValue')
    }

    fetchUsdValue() {
        cy.getByDataCy(this.valueUsdCy).invoke('text').then((text: unknown) => {
            return new Amount(USD, (text as string).onlyNumbers())
        }).as('confirmUsdValue')
    }

    fetchFrom() {
        cy.getByDataCy(this.fromCy).invoke('text').as('confirmFrom')
    }

    fetchTo() {
        cy.getByDataCy(this.toCy).invoke('text').as('confirmTo')
    }

    clickConfirm() {
        cy.getByDataCy(this.confirmButtonCy).click()
    }

    clickClose() {
        cy.getByDataCy(this.modalCy).findByDataCy(this.closeButtonCy).click()
    }
}

export class ConfirmWithdrawalModal extends ConfirmTransferModal {
    getAmount(): Amount {
        return null
    }

    getAmountUsd(): Amount {
        return null
    }

    getBridgeFee(): Amount {
        return null
    }

    getBridgeFeeUsd(): Amount {
        return null
    }

    getTransferAmount(): Amount {
        return null
    }

    getTransferAmountUsd(): Amount {
        return null
    }

    getGasFee(): Amount {
        return null
    }

    getGasFeeUsd(): Amount {
        return null
    }
}

export class TrxConfirmedModal{
    private okButtonCy = 'bridge-completed-button'
    private explorerLinkCy = 'bridge-completed-explorer-link'

    clickOk() {
        cy.getByDataCy(this.okButtonCy).click()
    }

    getExplorerLink() {
        cy.getByDataCy(this.explorerLinkCy).invoke('attr', 'href').as('okExplorerLink')
    }
}

export class AllowanceModal {
    getSelectedNetwork(): Network {
        return null
    }

    selectNetwork(network: Network) {

    }

    clickSetAllowance() {

    }
}