import Amount from "../../../../domain/injective/amount"
import { SpotOrder, TickerFactory, SideFactory } from "../../../../domain/injective/trade-record"


export default class SpotOrderComponent {
    readonly rowCy = 'order-row'
    readonly tickerCy = 'order-entry-ticker'
    readonly sideCy = 'order-entry-side'
    readonly priceCy = 'order-entry-price'
    readonly amountCy = 'order-entry-quantity'
    readonly unfilledCy = 'order-entry-unfilled'
    readonly filledCy = 'order-entry-filled'
    readonly totalCy = 'order-entry-total'

    fetchEntries(limit: number = null) {
        let operations = new Array<SpotOrder>()
        cy.getByContainingDataCy(this.rowCy).each(($e, i, _) => {
            if (!limit || (limit && i++ < limit)) {
                return new Cypress.Promise(resolve => {
                    let pairText = $e.find(`[data-cy=${this.tickerCy}]`).text().trim()
                    let side = $e.find(`[data-cy=${this.sideCy}]`).text().onlyLetters()
                    let price = $e.find(`[data-cy=${this.priceCy}]`).text().onlyNumbers()
                    let amount = $e.find(`[data-cy=${this.amountCy}]`).text().onlyNumbers()
                    let unfilled = $e.find(`[data-cy=${this.unfilledCy}]`).text().onlyNumbers()
                    let filled = $e.find(`[data-cy=${this.filledCy}]`).text().onlyNumbers()
                    let total = $e.find(`[data-cy=${this.totalCy}]`).text().onlyNumbers()
                    // let hash = $e.attr('data-cy-hash').trim()

                    let ticker = TickerFactory.fromText(pairText)
                    resolve(new SpotOrder(
                        ticker,
                        SideFactory.fromText(side),
                        new Amount(ticker.quoteAsset, price),
                        Number(amount),
                        Number(unfilled),
                        Number(filled),
                        new Amount(ticker.quoteAsset, total),
                        // hash
                        ))
                }).then((entry: SpotOrder) => {
                    operations.push(entry)
                })
            }
        }).then(() => {
            cy.wrap(operations).as('openOrders')
        })
    }
}