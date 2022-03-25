// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

import '@testing-library/cypress/add-commands'
import HeaderPart from '../pages/injective/exchange/header-part'
import 'cypress-wait-until';
import { TOAST_MAIN_CLASS, TOAST_SUCCESS_CLASS, TOAST_ERROR_CLASS } from '../pages/injective/exchange/partials/toast';

/// <reference types="cypress" />

Cypress.Commands.add('getByDataCy', (value) => {
  return cy.get(`[data-cy=${value}]`)
})

Cypress.Commands.add('getByContainingDataCy', (value) => {
  return cy.get(`[data-cy*=${value}]`)
})

Cypress.Commands.add('getByDataCyHash', (value) => {
  return cy.get(`[data-cy-hash="${value}"]`)
})

Cypress.Commands.add('findByDataCy', { prevSubject: 'element'}, (element, value) => {
  return cy.wrap(element).find(`[data-cy=${value}]`)
})

Cypress.Commands.add('initPuppeteer', () => {
  return cy.task('initPuppeteer')
})

Cypress.Commands.add('assignWindows', () => {
  return cy.task('assignWindows')
})

Cypress.Commands.add('importMetaMaskWalletUsingPrivateKey', privateKey => {
  return cy.task('importMetaMaskWalletUsingPrivateKey', { privateKey })
})

// puppeteer commands

Cypress.Commands.add('initPuppeteer', () => {
  return cy.task('initPuppeteer');
});

Cypress.Commands.add('assignWindows', () => {
  return cy.task('assignWindows');
});

Cypress.Commands.add('isMetamaskWindowActive', () => {
  return cy.task('isMetamaskWindowActive');
});

Cypress.Commands.add('isCypressWindowActive', () => {
  return cy.task('isCypressWindowActive');
});

Cypress.Commands.add('switchToCypressWindow', () => {
  return cy.task('switchToCypressWindow');
});

Cypress.Commands.add('switchToMetamaskWindow', () => {
  return cy.task('switchToMetamaskWindow');
});

Cypress.Commands.add('switchToMetamaskNotification', () => {
  return cy.task('switchToMetamaskNotification');
});

// metamask commands

Cypress.Commands.add('addMetamaskNetwork', network => {
  return cy.task('addMetamaskNetwork', network);
});

Cypress.Commands.add('changeMetamaskNetwork', network => {
  return cy.task('changeMetamaskNetwork', network);
});

Cypress.Commands.add('createMetamaskAccount', accountName => {
  return cy.task('createMetamaskAccount', accountName);
});

Cypress.Commands.add('closeNotification', () => {
  return cy.task('closeNotification');
});

Cypress.Commands.add('switchMetamaskAccount', accountNameOrAccountNumber => {
  return cy.task('switchMetamaskAccount', accountNameOrAccountNumber);
});

Cypress.Commands.add('getMetamaskWalletAddress', () => {
  cy.task('getMetamaskWalletAddress').then(address => {
    return address;
  });
});

Cypress.Commands.add('activateCustomNonceInMetamask', () => {
  return cy.task('activateCustomNonceInMetamask');
});

Cypress.Commands.add('resetMetamaskAccount', () => {
  return cy.task('resetMetamaskAccount');
});

Cypress.Commands.add('disconnectMetamaskWalletFromDapp', () => {
  return cy.task('disconnectMetamaskWalletFromDapp');
});

Cypress.Commands.add('disconnectMetamaskWalletFromAllDapps', () => {
  return cy.task('disconnectMetamaskWalletFromAllDapps');
});

// Cypress.Commands.add('confirmMetamaskSignatureRequest', () => {
//   return cy.task('confirmMetamaskSignatureRequest');
// });

// Cypress.Commands.add('rejectMetamaskSignatureRequest', () => {
//   return cy.task('rejectMetamaskSignatureRequest');
// });

Cypress.Commands.add('confirmMetamaskTransaction', () => {
  return cy.task('confirmMetamaskTransaction');
});

Cypress.Commands.add('rejectMetamaskTransaction', () => {
  return cy.task('rejectMetamaskTransaction');
});

Cypress.Commands.add('confirmMetamaskSignatureRequest', () => {
  return cy.task('confirmSignatureRequest');
});

Cypress.Commands.add('isMetamaskNotificationDisplayed', () => {
  return cy.task('isMetamaskNotificationDisplayed')
})

Cypress.Commands.add('rejectMetamaskSignatureRequest', () => {
  return cy.task('rejectSignatureRequest').then(() => {
    cy.assertFailureToastWithText('user denied message signature')
  })
});

Cypress.Commands.add('acceptMetamaskAccess', () => {
  return cy.task('acceptMetamaskAccess');
});

Cypress.Commands.add('acceptMetamaskAccessSafely', () => {
  return cy.task('acceptMetamaskAccessSafely');
});

Cypress.Commands.add('confirmMetamaskTransaction', gasConfig => {
  return cy.task('confirmMetamaskTransaction', gasConfig);
});

Cypress.Commands.add('rejectMetamaskTransaction', () => {
  return cy.task('rejectMetamaskTransaction');
});

Cypress.Commands.add('allowMetamaskToAddNetwork', () => {
  return cy.task('allowMetamaskToAddNetwork');
});

Cypress.Commands.add('rejectMetamaskToAddNetwork', () => {
  return cy.task('rejectMetamaskToAddNetwork');
});

Cypress.Commands.add('allowMetamaskToSwitchNetwork', () => {
  return cy.task('allowMetamaskToSwitchNetwork');
});

Cypress.Commands.add('rejectMetamaskToSwitchNetwork', () => {
  return cy.task('rejectMetamaskToSwitchNetwork');
});

Cypress.Commands.add('allowMetamaskToAddAndSwitchNetwork', () => {
  return cy.task('allowMetamaskToAddAndSwitchNetwork');
});

Cypress.Commands.add('unlockMetamask', (password = 'Tester@1234') => {
  return cy.task('unlockMetamask', password);
});

Cypress.Commands.add('fetchMetamaskWalletAddress', () => {
  cy.task('fetchMetamaskWalletAddress').then(address => {
    return address;
  });
});

Cypress.Commands.add(
  'setupMetamask',
  (secretWordsOrPrivateKey, network, password = 'Tester@1234') => {
    return cy.task('setupMetamask', {
      secretWordsOrPrivateKey,
      network,
      password,
    });
  },
);

Cypress.Commands.add('getNetwork', () => {
  return cy.task('getNetwork');
});

Cypress.Commands.add('etherscanGetTransactionStatus', txid => {
  return cy.task('etherscanGetTransactionStatus', { txid }, { timeout: 30000 });
});

Cypress.Commands.add('etherscanWaitForTxSuccess', txid => {
  return cy.task('etherscanWaitForTxSuccess', { txid }, { timeout: 120000 });
});

Cypress.Commands.add('connectWallet', () => {
  new HeaderPart().connectWallet()
});

Cypress.Commands.add('assertAnySuccessToast', () => {
  cy.get(`${TOAST_MAIN_CLASS}${TOAST_SUCCESS_CLASS}`).then($e => {
    cy.wrap($e).should('be.visible').then(() => {
      $e.remove()
    })
  })
})

Cypress.Commands.add('assertSuccessToastWithText', (text: string) => {
  let found = false
  cy.get(`${TOAST_MAIN_CLASS}${TOAST_SUCCESS_CLASS}`).each($e => {
      if ($e.text().toLowerCase().indexOf(text.toLowerCase()) !== -1) {
        found = true
      }
      $e.remove()
  }).then(() => {
    expect(found, `Success toast containg text '${text}' found`).to.be.true
  })
})

Cypress.Commands.add('assertFailureToastWithText', (text: string) => {
  let found = false
  cy.get(`${TOAST_MAIN_CLASS}${TOAST_ERROR_CLASS}`).each($e => {
      if ($e.text().toLowerCase().indexOf(text.toLowerCase()) !== -1) {
        found = true
      }
      $e.remove()
  }).then(() => {
    expect(found, `Failure toast containg text '${text}' found`).to.be.true
  })
})

Cypress.Commands.add('assertNoFailureToast', () => {
  cy.get(`${TOAST_MAIN_CLASS}${TOAST_ERROR_CLASS}`).should('not.be.visible')
})

//todo look at in the future
// Cypress.Commands.add('waitForResources', (resources = []) => {
//   const globalTimeout = 30000;
//   const resourceCheckInterval = 2000;
//   const idleTimesInit = 3;
//   let idleTimes = idleTimesInit;
//   let resourcesLengthPrevious;
//   let timeout;

//   return new Cypress.Promise((resolve, reject) => {
//     const checkIfResourcesLoaded = () => {
//       const resourcesLoaded = cy
//         .state('window')
//         .performance.getEntriesByType('resource')
//         .filter(r => !['script', 'xmlhttprequest'].includes(r.initiatorType));

//       const allFilesFound = resources.every(resource => {
//         const found = resourcesLoaded.filter(resourceLoaded => {
//           return resourceLoaded.name.includes(resource.name);
//         });
//         if (found.length === 0) {
//           return false;
//         }
//         return !resource.number || found.length >= resource.number;
//       });

//       if (allFilesFound) {
//         if (resourcesLoaded.length === resourcesLengthPrevious) {
//           idleTimes--;
//         } else {
//           idleTimes = idleTimesInit;
//           resourcesLengthPrevious = resourcesLoaded.length;
//         }
//       }
//       if (!idleTimes) {
//         resolve();
//         return;
//       }

//       timeout = setTimeout(checkIfResourcesLoaded, resourceCheckInterval);
//     };

//     checkIfResourcesLoaded();
//     setTimeout(() => {
//       reject();
//       clearTimeout(timeout);
//     }, globalTimeout);
//   });
// });

// // overwrite default cypress commands
// if (!Cypress.env('SKIP_RESOURCES_WAIT')) {
//   Cypress.Commands.overwrite('visit', (originalFn, url, options) => {
//     originalFn(url, options);
//     return cy.waitForResources();
//   });
// }

// Convert this to a module instead of script (allows import/export)
export {}