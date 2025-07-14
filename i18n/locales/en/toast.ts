export default {
  toast: {
    error: 'Error',
    success: 'Success',
    addressCopied: 'Address copied',
    viewOnInjScan: 'View on InjScan',
    contextCopied: 'Context copied!',
    marketIdCopied: 'Market ID copied',
    somethingHappened: 'Something happened...',
    connectedSuccessfully: 'Connected successfully ',
    copiedAddressToClipboard: 'Address copied to clipboard',
    formSubmittedSuccessfully: 'Form submitted successfully.',
    transactionFinalized: 'Tx finalized in {duration} sec. {viewOnInjScan}',
    onramperSuccess:
      'Success! You bought {cryptoAmount} {crypto} for {fiatCurrency}. Tokens are on their way.',

    account: {
      authZAdded: 'AuthZ account added',
      assetsTransferred: 'Assets transferred to your account',
      transferToSubaccountSuccess: 'Subaccount transfer successful'
    },
    authz: {
      connectedAs: 'Connected as'
    },
    portfolio: {
      buyInj: 'Buy INJ',
      bridgeNow: 'Bridge now',
      bankTransferSuccessful: 'Transfer successful',
      startTradingInSeconds: 'Start Trading in Seconds!',
      readyToTrade: 'Ready to Trade? Explore Markets Now!',
      moveAssetsToInj: 'Move assets from Ethereum to Injective',
      discoverTrendingPairs: 'Discover trending pairs and start trading',
      moveAssetsToInjTitle: 'Move Your Crypto to Injective & Start Trading',
      topUpWithCreditOrDebit:
        'Top up with credit or debit and start trading today.',
      autoSign: {
        disabledToast: 'Auto sign disabled',
        enabledToast: {
          title: 'Auto sign enabled',
          description: 'Auto sign enabled for 3 days.'
        },
        enable: {
          title: 'Auto Sign',
          description:
            'Once enabled, you can trade on Helix more smoothly, without signing each transaction.'
        }
      }
    },
    trade: {
      invalidPrice: 'Invalid price',
      orderCancelled: 'Order cancelled',
      positionClosed: 'Position closed',
      noLiquidity: 'Not enough liquidity',
      orderPlaced: 'Order placed successfully',
      tpSuccessMessage: 'TP is set to {price}',
      slSuccessMessage: 'SL is set to {price}',
      allOrdersCancelled: 'All orders cancelled',
      orderUpdated: 'Order updated successfully',
      slOrderCancelled: 'Stop loss order cancelled',
      successAddedMargin: 'Margin added successfully',
      tpOrderCancelled: 'Take profit order cancelled',
      advancedOrderCancelled: 'Advanced order cancelled',
      allAdvancedOrdersCancelled: 'All advanced orders cancelled',
      rwaMarketClosedToast:
        'This market is currently closed. You may place a trade anyway, but beware of the risks involved.',

      neptuneUsdt: {
        success: {
          deposit: 'Neptune deposit successful',
          withdraw: 'Neptune withdrawal successful'
        }
      },
      tradeToast: {
        sold: '{quantity} {symbol} sold at average price ${usdPrice}',
        bought: '{quantity} {symbol} bought at average price ${usdPrice}'
      }
    },
    referral: {
      referralLinkCopied: 'Referral Link Copied',
      referralLinkIsUnavailable: 'Referral Link is Unavailable',
      success: 'Your Code is Successfully Claimed. Explore Markets Now!',
      referralLinkExists:
        'You have already applied another referral code to this wallet',
      joinSelfReferralMessage:
        "Your referral code is valid, but you can't refer yourself. Share it with someone else!"
    },
    leaderboard: {
      receivedInformation:
        "We've received your information; our team will reach out to you shortly"
    },
    campaign: {
      errorAlreadyClaimed: 'Reward already claimed',
      notFound: 'Campaign not found; please try again later',
      successfullyClaimedRewards: 'Rewards claimed successfully.'
    },
    guild: {
      successfullyJoinGuild: 'Successfully joined guild',
      successfullyCreateGuild: 'Successfully created guild',
      copiedInvitationLink: 'Invitation code copied to your clipboard.'
    },
    tradingBots: {
      tradingBotRemovedSuccessfully: 'Trading bot removed successfully',
      tradingBotCreatedSuccessfully: 'Trading bot created successfully'
    },
    stockTwits: {
      startHere: 'Start here',
      title: '👋 New to Helix?',
      description: 'Start trading crypto & tokenized stocks with ease.'
    }
  }
}
