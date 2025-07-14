import { ReferralTableColumn } from '@/types'

export default {
  referral: {
    share: 'Share',
    approve: 'Approve',
    referNow: 'Refer Now',
    noReferrals: 'No referrals',
    referralLink: 'Referral Link',
    referAndEarn: 'Refer and Earn',
    confirmReferral: 'Confirm Referral',
    referralDetails: 'Referral Details',
    scanToJoin: 'Scan to Join Helix or',
    yourReferralLink: 'Your Referral Link',
    checkAvailability: 'Check Availability',
    affiliatedAddress: 'Affiliated Address',
    startEarningToday: 'Start earning today',
    createReferralLinkPlaceholder: 'BULLISH',
    customReferralCode: 'Custom Referral Code',
    chooseDifferentLink: 'Choose Different Link',
    dashboardTitle: 'Refer Traders, Earn Rewards',
    referralLinkAvailable: 'Referral Link Available!',
    lettersAndNumbersOnly: 'letters and numbers only',
    confirmAndGenerateLink: 'Confirm and Generate Link',
    createReferralLinkTitle: 'Create Your Referral Link',
    trackYourReferrals: 'Track your referrals and earned commissions',
    shareYourReferralLink: 'Share your referral link and invite friends.',
    referralCodeMaxLengthMessage: 'Referral code can be up to 32 characters',
    dashboardSubtitle:
      'Refer users to earn rewards. Affiliates earn greater rewards.',
    createReferralLinkSubtitle:
      'Choose a unique link that will be used to track your referrals. Make it memorable and easy to share.',
    rewardsTooltipContent:
      "The total commission you’ve earned from successful referrals. Rewards are credited based on your referrals' trading activity.",
    referralLinkAvailableDescription:
      'Your referral code {baseUrl}/ref/{referralCode} is available. Would you like to use this link?',
    confirmReferralDescription:
      'You will be referred with {baseUrl}/ref/{referralCode}. Please confirm if you would like to be affiliated with this address.',

    table: {
      [ReferralTableColumn.Wallets]: 'Wallets',
      [ReferralTableColumn.JoinDate]: 'Join Date',
      [ReferralTableColumn.Commission]: 'Commission'
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
