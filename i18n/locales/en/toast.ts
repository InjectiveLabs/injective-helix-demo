export default {
  toast: {
    error: 'Error',
    success: 'Success',
    addressCopied: 'Address Copied',
    somethingHappened: 'Something Happened...',
    successfullyConnected: 'Successfully Connected',
    formSubmittedSuccesfully: 'Form Submitted Successfully.',
    copiedAddressToClipboard: 'Address copied to your clipboard',
    subscribeToast: "You've successfully signed up for Helix notifications!",
    onramperSuccess:
      'Success! You bought {cryptoAmount} {crypto} for {fiatCurrency}. Tokens are on their way.',
    account: {
      transferToSubaccountSuccess: 'Subaccount transfer successful'
    },
    portfolio: {
      tradeNow: 'Trade Now',
      bridgeNow: 'Bridge Now',
      buyCrypto: 'Buy crypto',
      buyCryptoInstantly: 'Buy crypto instantly',
      bankTransferSuccessful: 'Transfer Successful',
      startTradingInSeconds: 'Start Trading in Seconds!',
      readyToTrade: 'Ready to Trade? Explore Markets Now!',
      moveAssetsToInj: 'Move assets from Ethereum to Injective',
      discoverTrendingPairs: 'Discover trending pairs and start trading',
      moveAssetsToInjTitle: 'Move Your Crypto to Injective & Start Trading',
      autoSign: {
        disabledToast: 'Auto sign is disabled',
        allowsYouToTrade:
          'Allows you to trade on Helix for 72 hours without needing to sign most transactions. Auto-Sign can be deactivated any time.',
        enabledToast: {
          title: 'Auto sign is enabled',
          description: 'Auto sign is active for 3 days.'
        }
      }
    },
    trade: {
      invalid_price: 'Invalid Price',
      position_closed: 'Position Closed',
      no_liquidity: 'Not enough Liquidity',
      order_placed: 'Your order has been placed',
      order_success_cancelling: 'Order Cancelled',
      orderUpdated: 'Your order has been updated',
      success_added_margin:
        'You have successfully added margin to your position',
      tpSuccessMessage:
        'your take profit order has been set for {quantity} quantity at {price} price',
      slSuccessMessage:
        'your stop loss order has been set for {quantity} quantity at {price} price',
      rwaMarketClosedToast:
        'This market is currently closed. You may place a trade anyway, but beware of the risks involved.',
      neptuneUsdt: {
        success: {
          deposit: 'Neptune Deposit Successful',
          withdraw: 'Neptune Withdrawal Succesful'
        }
      },
      tradeToast: {
        bought:
          "{'{{'}quantity:{quantity}-{quantityDecimals}{'}}'} {symbol} bought at average price {'$'}{'{{'}usdPrice:{usdPrice}-{usdPriceDecimals}{'}}'}",
        sold: "{'{{'}quantity:{quantity}-{quantityDecimals}{'}}'} {symbol} sold at average price {'$'}{'{{'}usdPrice:{usdPrice}-{usdPriceDecimals}{'}}'}"
      }
    },
    referral: {
      referralLinkCopied: 'Referral Link Copied',
      referralLinkIsUnavailable: 'Referral Link is Unavailable',
      success: 'Your code is successfully claimed. Explore Markets Now!',
      joinSelfReferralMessage:
        "Your referral code is valid, but you can't refer yourself. Share it with someone else!"
    },
    leaderboard: {
      receivedInformation:
        "We've received your information. Our team will reach out to you shortly."
    },
    campaign: {
      notFound: 'Campaign not found, please try again later.',
      successfullyClaimedRewards: 'Succesfuly Claimed Rewards',
      errorAlreadyClaimed: 'This reward has already been claimed.'
    },
    guild: {
      successfullyJoinGuild: 'Successfully joined guild',
      successfullyCreateGuild: 'Successfully created guild',
      copiedInvitationLink: 'Invitation code copied to your clipboard.'
    },
    sgt: {
      strategyRemoved: 'Strategy Removed!',
      gridStrategyRemovedSuccessfully: 'Grid Strategy Removed Successfully!',
      gridStrategyCreatedSuccessfully: 'Grid Strategy Created Successfully!'
    }
  }
}
