
export default class NotificationPage {
    public notificationPage = '.notification';
    public nextButton = `${this.notificationPage} .permissions-connect-choose-account__bottom-buttons button:nth-child(2)`;

    public permissionsPage = '.permissions-connect';
    public connectButton = `${this.permissionsPage} .permission-approval-container__footers button:nth-child(2)`;

    public rejectSignatureRequestButton = `${this.notificationPage} .signature-request-footer button:nth-child(1)`;
    public confirmSignatureRequestButton = `${this.notificationPage} .signature-request-footer button:nth-child(2)`;

    public confirmPageHeader = `${this.notificationPage} .confirm-page-container-header`;
    public confirmPageContent = `${this.notificationPage} .confirm-page-container-content`;
    public confirmPageGasFeeSection = `${this.confirmPageContent} .confirm-page-container-content__gas-fee`;
    public gasFeeLabel = `${this.confirmPageGasFeeSection} .currency-display-component__text`;
    public gasFeeInput = `${this.confirmPageGasFeeSection} .advanced-gas-inputs__gas-edit-row:nth-child(1) .advanced-gas-inputs__gas-edit-row__input`;
    public gasLimitInput = `${this.confirmPageGasFeeSection} .advanced-gas-inputs__gas-edit-row:nth-child(2) .advanced-gas-inputs__gas-edit-row__input`;
    public totalLabel = `${this.confirmPageContent} div:nth-child(2) > .confirm-detail-row .currency-display-component__text`;
    public rejectButton = `${this.confirmPageContent} [data-testid="page-container-footer-cancel"]`;
    public confirmButton = `${this.confirmPageContent} [data-testid="page-container-footer-next"]`;

    public messageContent = `${this.notificationPage} .signature-request-message--root`
}