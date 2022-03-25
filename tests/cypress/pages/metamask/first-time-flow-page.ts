export default class FirstTimeFlowPage {
    public app = '#app-content .app'
    public welcomePage = '.welcome-page'
    public confirmButton = `${this.welcomePage} .first-time-flow__button`
    public firstTimeFlowPage = '.first-time-flow'
    public importWalletButton = `${this.firstTimeFlowPage} .first-time-flow__button`

    public metametricsPage = '.metametrics-opt-in'
    public optOutAnalyticsButton = `${this.metametricsPage} [data-testid="page-container-footer-cancel"]`

    public firstTimeFlowFormPage = '.first-time-flow__form'
    public secretWordsInput = `${this.firstTimeFlowFormPage} .first-time-flow__seedphrase input`
    public passwordInput = `${this.firstTimeFlowFormPage} #password`
    public confirmPasswordInput = `${this.firstTimeFlowFormPage} #confirm-password`
    public termsCheckbox = `${this.firstTimeFlowFormPage} .first-time-flow__terms`
    public importButton = `${this.firstTimeFlowFormPage} .first-time-flow__button`

    public endOfFlowPage = '.end-of-flow'
    public allDoneButton = `${this.endOfFlowPage} .first-time-flow__button`

    public revealSeedPage = '.reveal-seed-phrase'
    public remindLaterButton = `${this.revealSeedPage} .first-time-flow__button`
}