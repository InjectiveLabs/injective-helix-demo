import { ReferralTableColumn } from '@/types'

const siteFullUrl = useRequestURL()

export default {
  referral: {
    weAreStillInBeta: 'We are still in Beta',
    betaDescription:
      'This feature is still in beta, and it looks like you don’t have access just yet. But great things are worth the wait!',
    betaCtaTitle1: 'Gain real-time insights',
    betaCtaDescription1:
      'Don’t miss out—explore the markets, track trends, and stay ahead of the game.',
    betaCtaTitle2: 'Explore Our Community',
    betaCtaDescription2:
      'Connect with like-minded pioneers. Your next big opportunity is just around the corner!',
    share: 'Share',
    approve: 'Approve',
    referNow: 'Refer Now',
    noReferrals: 'No referrals',
    referralLink: 'Referral Link',
    referAndEarn: 'Refer and Earn',
    exploreMarkets: 'Explore Markets',
    confirmReferral: 'Confirm Referral',
    referralDetails: 'Referral Details',
    scanToJoin: 'Scan to Join Helix or',
    yourReferralLink: 'Your Referral Link',
    checkAvailability: 'Check Availability',
    affiliatedAddress: 'Affiliated Address',
    startEarningToday: 'Start earning today',
    createReferralLinkPlaceholder: 'TRUMPUMP',
    referralLinkCopied: 'Referral Link Copied',
    customReferralCode: 'Custom Referral Code',
    chooseDifferentLink: 'Choose Different Link',
    dashboardTitle: 'Refer Traders, Earn Rewards',
    unableToJoinReferral: 'Unable to Join Referral',
    referralLinkAvailable: 'Referral Link Available!',
    lettersAndNumbersOnly: 'letters and numbers only',
    confirmAndGenerateLink: 'Confirm and Generate Link',
    createReferralLinkTitle: 'Create Your Referral Link',
    referralLinkIsUnavailable: 'Referral Link is Unavailable',
    trackYourReferrals: 'Track your referrals and earned commissions',
    shareYourReferralLink: 'Share your referral link and invite friends.',
    dashboardSubtitle:
      'Refer users to earn rewards. Affiliates earn greater rewards.',
    success: `You've successfully affiliated with ${siteFullUrl.origin}/ref/{referralCode}.`,
    createReferralLinkSubtitle:
      'Choose a unique link that will be used to track your referrals. Make it memorable and easy to share.',
    referralLinkAvailableDescription: `Your referral code ${siteFullUrl.origin}/ref/{referralCode} is available. Would you like to use this link?`,
    confirmReferralDescription: `You will be referred with ${siteFullUrl.origin}/ref/{referralCode}. Please confirm if you would like to be affiliated with this address.`,
    table: {
      [ReferralTableColumn.Wallets]: 'Wallets',
      [ReferralTableColumn.Commission]: 'Commission',
      [ReferralTableColumn.JoinDate]: 'Join Date'
    },
    myStats: {
      title: 'My Stats',
      rewardsEarned: 'Rewards Earned',
      tradersReffered: 'Traders Referred'
    },
    referFriends: {
      title: 'How to Refer your Friends',
      step3Title: 'Auto-Receive rewards',
      step2Title: 'Invite friends earn 40%',
      step1Title: 'Share your referral link',
      step2Description: 'Add as many friends you want.',
      description1: 'Invite your network to trade on Helix',
      step1Description: 'You can generate your unique link.',
      description2: ' and earn 40% of their fees as commission.',
      step3Description: 'Receive your rewards instantly in your crypto wallet.'
    },
    shareModal: {
      title: 'Invite Your Friends!',
      customizeYourText: 'Customize your text',
      description: 'Scan QR code and join me at Helix!',
      defaultText:
        'Track your rewards, and cash out anytime. Invite your network to trade on Helix and earn 40% of their fees as commission.'
    }
  }
}
