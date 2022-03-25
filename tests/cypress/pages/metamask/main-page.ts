export class MainPage {
  public walletOverview = '.wallet-overview'
  public loadingSpinner = '.lds-spinner'
}

export class AccountMenu {
  public button = '.account-menu__icon'
  public settingsButton = '.account-menu__item--clickable:nth-child(11)'
  public accountsSection = '.account-menu__accounts'
  public firstAccount = '.account-menu__accounts:nth-child(1)'
  public secondAccount = '.account-menu__accounts:nth-child(2)'
  public accountsSelector = '.account-menu__name'
  public importAccount = '.account-menu__item account-menu__item--clickable'
  public importButton = '.new-account-create-form__button'
  public privateKeyBox = '#private-key-box'
}

export class NetworkSwitcherPart {
  public button = '.network-display'
  public networkName = '.typography'
  public dropdownMenuItem = '.dropdown-menu-item'
  public networkButton(number: number): string { 
    return `.dropdown-menu-item:nth-child(${3 + number})` 
  }
}

export class Popup {
  public container = '.popover-container'
  public closeButton = '.popover-header__button'
}

export class SettingsPage {
  public networksButton ='.settings-page button:nth-child(6)'
}

export class NetworksPage {
  public addNetworkButton = '.networks-tab__body button'
  public closeButton = '.settings-page__close-button'
}

export class AddNetworkPage {
  public networkNameInput = '#network-name'
  public rpcUrlInput = '#rpc-url'
  public chainIdInput = '#chainId'
  public symbolInput = '#network-ticker'
  public blockExplorerInput = '#block-explorer-url'
  public saveButton = '.network-form__footer button:nth-child(2)'
}

export class OptionsPage {
  public button = '[data-testid=account-options-menu-button]'
  public accountDetailsButton = '[data-testid="account-options-menu__account-details"]'
}

export class AccountModal {
  public walletAddressInput = '.account-modal input'
  public closeButton = '.account-modal__close'
}