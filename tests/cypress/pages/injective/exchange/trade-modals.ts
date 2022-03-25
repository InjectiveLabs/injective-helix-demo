import Amount from "../../../domain/injective/amount"
import { AssetFactory } from "../../../domain/injective/assets"

export class AddMarginModal {
    readonly addButtonCy = 'add-margin-execute-button'
    readonly availableCy = 'add-margin-available'
    readonly amountInputCy = 'add-margin-amount-input'
    readonly maxButtonCy = 'max-button'

    fetchAvailableMargin() {
        cy.getByDataCy(this.availableCy).invoke('text').then(text => {
            let coin = AssetFactory.fromText(text.onlyLetters())
            return new Amount(coin, text.onlyNumbers())
        }).as('addMarginAvailable')
    }

    clickMax()  {
        cy.getByDataCy(this.maxButtonCy).click()
    }

    enterAmount(amount: string) {
        cy.getByDataCy(this.amountInputCy).type(amount)
    }

    clickAddMargin() {
        cy.getByDataCy(this.addButtonCy).click()
    }
}