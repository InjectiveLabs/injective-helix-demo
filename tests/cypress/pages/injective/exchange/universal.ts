import HeaderPart from "./header-part"

export class LoadingSpinner {
    readonly rootCy = 'loading-spinner'

    waitUntilGone() {
        cy.getByDataCy(this.rootCy).should('not.be.visible')
    }
}

export class BaseInjectivePage {
    protected header = new HeaderPart()
    private spinner = new LoadingSpinner()

    spinnerIsGone() {
        this.spinner.waitUntilGone()
    }
}