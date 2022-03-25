import Amount from "../../../../domain/injective/amount"
import { Position, TickerFactory, SideFactory, Ticker } from "../../../../domain/injective/trade-record"

export default class PositionsComponent {
    readonly rowCy = 'position-row'
    readonly tickerCy = 'position-entry-ticker'
    readonly sideCy = 'position-entry-side'
    readonly priceCy = 'position-entry-price'
    readonly amountCy = 'position-entry-quantity'
    readonly liquidationCy = 'position-entry-liquidationPrice'
    readonly totalCy = 'position-entry-total'
    readonly marginCy = 'position-entry-margin'
    readonly leverageCy = 'position-entry-leverage'
    readonly addMarginButtonCy = 'position-entry-add-margin-button'

    fetchEntries(limit: number = null) {
        let operations = new Array<Position>()
        cy.getByContainingDataCy(this.rowCy).each(($e, i, _) => {
            if (!limit || (limit && i++ < limit)) {
                return new Cypress.Promise(resolve => {
                    let tickerText = $e.find(`[data-cy=${this.tickerCy}]`).text().trim()
                    let side = $e.find(`[data-cy=${this.sideCy}]`).text().onlyLetters()
                    let entryPrice = $e.find(`[data-cy=${this.priceCy}]`).text().onlyNumbers()
                    let amount = $e.find(`[data-cy=${this.amountCy}]`).text().onlyNumbers()
                    let liquidation = $e.find(`[data-cy=${this.liquidationCy}]`).text().onlyNumbers()
                    let total = $e.find(`[data-cy=${this.totalCy}]`).text().onlyNumbers()
                    let margin = $e.find(`[data-cy=${this.marginCy}]`).text().onlyNumbers()
                    // let hash = $e.attr('data-cy-hash').trim()

                    let ticker = TickerFactory.fromText(tickerText)
                    resolve(new Position(
                        ticker,
                        SideFactory.fromText(side),
                        new Amount(ticker.quoteAsset, entryPrice),
                        Number(amount),
                        new Amount(ticker.quoteAsset, liquidation),
                        null,
                        new Amount(ticker.quoteAsset, total),
                        // null,
                        Number(margin),
                        null,
                        // hash
                        ))
                }).then((entry: Position) => {
                    operations.push(entry)
                })
            }
        }).then(() => {
            cy.wrap(operations).as('openPositions')
        })
    }

    cancelEntryWithTicker(ticker: Ticker) {
        cy.getByContainingDataCy('-row-').each(($e, i, _) => {
            if ($e.find('[data-cy*=ticker]').text().toLowerCase().indexOf(ticker.toString().toLowerCase()) > -1) {
                cy.wrap($e.find(`[data-cy*=cancel-link]`)).click()
                return
            }
        })
    }

    clickAddMarginButton(ticker: Ticker) {
        cy.getByContainingDataCy('-row-').each(($e, i, _) => {
            if ($e.find('[data-cy*=ticker]').text().toLowerCase().indexOf(ticker.toString().toLowerCase()) > -1) {
                cy.wrap($e.find(`[data-cy='${this.addMarginButtonCy}']`)).click()
                return
            }
        })
    }
}