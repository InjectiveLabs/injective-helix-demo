export default {
  toast: {
    error: 'Error',
    success: 'Success',
    addressCopied: 'Address copied',
    somethingHappened: 'Something happened...',
    connectedSuccessfully: 'Connected successfully ',
    formSubmittedSuccessfully: 'Form submitted successfully.',
    copiedAddressToClipboard: 'Address copied to clipboard',
    subscribeToast: 'Signed up for Helix notifications',
    onramperSuccess:
      'Success! You bought {cryptoAmount} {crypto} for {fiatCurrency}. Tokens are on their way.',
    account: {
      transferToSubaccountSuccess: 'Subaccount transfer successful'
    },
    portfolio: {
      tradeNow: 'Trade now',
      bridgeNow: 'Bridge now',
      buyCrypto: 'Buy crypto',
      getCryptoWithFiat: 'Get crypto with FIAT',
      bankTransferSuccessful: 'Transfer successful',
      startTradingInSeconds: 'Start Trading in Seconds!',
      readyToTrade: 'Ready to Trade? Explore Markets Now!',
      moveAssetsToInj: 'Move assets from Ethereum to Injective',
      discoverTrendingPairs: 'Discover trending pairs and start trading',
      moveAssetsToInjTitle: 'Move Your Crypto to Injective & Start Trading',
      autoSign: {
        disabledToast: 'Auto sign disabled',
        allowsYouToTrade:
          'Allows trading on Helix for 3 days; can be deactivated at any time',
        enabledToast: {
          title: 'Auto sign enabled',
          description: 'Auto sign active for 3 days'
        }
      }
    },
    trade: {
      invalid_price: 'Invalid price',
      position_closed: 'Position closed',
      no_liquidity: 'Not enough liquidity',
      order_placed: 'Order placed successfully',
      order_success_cancelling: 'Order cancelled',
      orderUpdated: 'Order updated successfully',
      success_added_margin: 'Margin added successfully',
      tpSuccessMessage:
        'your take profit order has been set for {quantity} quantity at {price} price',
      slSuccessMessage:
        'your stop loss order has been set for {quantity} quantity at {price} price',
      rwaMarketClosedToast:
        'This market is currently closed. You may place a trade anyway, but beware of the risks involved.',
      neptuneUsdt: {
        success: {
          deposit: 'Neptune deposit successful',
          withdraw: 'Neptune withdrawal successful'
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
        'We’ve received your information; our team will reach out to you shortly '
    },
    campaign: {
      notFound: 'Campaign not found; please try again later',
      successfullyClaimedRewards: 'Rewards claimed successfully',
      errorAlreadyClaimed: 'Reward already claimed'
    },
    guild: {
      successfullyJoinGuild: 'Successfully joined guild',
      successfullyCreateGuild: 'Successfully created guild',
      copiedInvitationLink: 'Invitation code copied to your clipboard.'
    },
    sgt: {
      strategyRemoved: 'strategy removed successfully',
      gridStrategyRemovedSuccessfully: 'Grid strategy removed successfully',
      gridStrategyCreatedSuccessfully: 'Grid strategy created successfully'
    }
  }
}
