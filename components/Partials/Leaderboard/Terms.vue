<script lang="ts" setup>
import { MainPage, LeaderboardSubPage } from '@/types'
</script>

<template>
  <div>
    <h1 class="text-3xl font-bold mb-4 text-center uppercase">
      HELIX TRADING COMPETITION AND GIVEAWAY
    </h1>

    <h2 class="text-xl font-semibold mb-6 text-center uppercase">
      OFFICIAL RULES, TERMS, AND CONDITIONS
    </h2>

    <p class="font-semibold text-center mb-8 uppercase">
      NO PURCHASE NECESSARY FOR THE RANDOM DRAWING GIVEAWAY. A PURCHASE WILL NOT
      IMPROVE YOUR CHANCE OF WINNING THE RANDOM DRAWING GIVEAWAY.
    </p>

    <h3 class="text-lg font-bold mb-2 uppercase">COMPETITION DESCRIPTION:</h3>
    <p class="mb-4">
      The Helix Trading Competition and Giveaway (collectively the
      “Competition”) begins on September 30[date], 2024 at [12:00 p.m.] Eastern
      Time (“ET”) and ends on October 21[date], 2024 at [12:00 p.m.] ET (the
      “Competition Period”). The two winners of the Competition will each
      receive an electric Mercedes Benz G-Wagon or its cash equivalent, at the
      Sponsor’s sole discretion and subject to these Rules, Terms, and
      Conditions (“Rules”). During the Competition Period, entrants (“Entrants”)
      will have the opportunity to compete to achieve the best trading
      performance on the Helix trading application using the application’s front
      end, with the winner being the Entrant with the best “PNL” as measured by
      the Helix Competition Leaderboard, (“PNL Winner”). There will also be a
      separate random drawing giveaway to determine a second winner, who will be
      chosen at random from Competition Entrants (“Giveaway Winner”) who may
      enter by trading on Helix or by completing and submitting a form, as
      described herein. By participating in the Competition, each Entrant
      unconditionally accepts and agrees to comply with and abide by these Rules
      and the decisions of the Injective Foundation (“Sponsor”) which shall be
      final and binding in all respects.
    </p>

    <h3 class="text-lg font-bold mb-2 uppercase">ELIGIBILITY:</h3>
    <p class="mb-4">
      The Competition is open only to Entrants who are 18 years of age or older
      at the time of entry. Residents of the United States, the United Kingdom
      (unless they are _____), Cuba, Iran, North Korea, Sudan, Syria and
      countries currently subject to United States embargo or on the United
      States list of state sponsors of terrorism are not eligible to
      participate. For a current list of countries currently subject to United
      States embargo or on the United States list of state sponsors of
      terrorism, go to
      <NuxtLink
        href="https://www.state.gov/economic-sanctions-programs/"
        class="text-blue-500 hover:text-blue-600"
      >
        https://www.state.gov/economic-sanctions-programs/
      </NuxtLink>
      <span>.</span>
    </p>
    <p class="mb-4">
      The following individual and entities (all such individuals and entities
      referred to collectively as the “Competition Entities”) are NOT eligible
      to enter the Competition or win a prize: Officers, directors, employees,
      contractors, and agents of Sponsor, and Sponsor’s parents, subsidiaries,
      affiliates, members, distributors, retailers, sales representatives
      (including, but not limited to, any individual or entity paid to promote
      the Competition by Sponsor or its agents or contractors), advertising and
      Competition agencies, and each of their immediate family members and/or
      people living in the same household.
    </p>
    <p class="mb-4">This Competition is void where prohibited.</p>
    <p class="mb-4">
      An individual or entity cannot be both the PNL Winner and the Giveaway
      Winner. The PNL Winner will be excluded from the Giveaway.
    </p>

    <h3 class="text-lg font-bold mb-2 uppercase">HOW TO ENTER:</h3>
    <p class="mb-4">
      To participate in the Competition, you must comply with the following
      instructions to submit an entry (“Entry”):
    </p>

    <h4 class="text-base font-semibold mb-2 uppercase">
      To Enter the PNL Contest:
    </h4>
    <ol class="list-decimal list-inside mb-4">
      <li class="mb-2">
        Entrants must connect a wallet to or create an account on the Helix
        application at
        <NuxtLink
          href="https://www.helixapp.com"
          class="text-blue-500 hover:text-blue-600"
        >
          www.helixapp.com
        </NuxtLink>
        <span>
          (the “Application”) and engage in trading on the Application.
          Instructions for creating an account on the Application are available
          at
        </span>
        <NuxtLink
          href="https://www.helixapp.com"
          class="text-blue-500 hover:text-blue-600"
        >
          www.helixapp.com
        </NuxtLink>
        <span>.</span>
        <span>
          Use of the Application is subject to the terms and conditions located
          at
        </span>
        <NuxtLink
          :to="{ name: MainPage.Terms }"
          class="text-blue-500 hover:text-blue-600"
        >
          https://www.helixapp.com/terms
        </NuxtLink>
        <span>
          (the “Terms”). All trades conducted through the front end of the
          Application during the Competition Period will be included for
          purposes of the Competition. Trades conducted through the Helix API
          will not be counted. The Entrant with the best PNL at the end of the
          Competition Period, as calculated as described in the Helix trading
          documentation available at
        </span>
        <NuxtLink
          href="https://docs.trading.injective.network"
          class="text-blue-500 hover:text-blue-600"
        >
          https://docs.trading.injective.network
        </NuxtLink>
        <span>
          , and as displayed on the Helix Competition Leaderboard, available at
        </span>
        <NuxtLink
          :to="{ name: LeaderboardSubPage.Competition }"
          class="text-blue-500 hover:text-blue-600"
        >
          https://helixapp.com/leaderboard/competition
        </NuxtLink>
        <span>
          (“Helix Leaderboard”) on the Application, will determine the PNL
          Winner.
        </span>
      </li>
    </ol>

    <h4 class="text-base font-semibold mb-2 uppercase">
      To Enter the Giveaway:
    </h4>
    <ol class="list-decimal list-inside mb-4">
      <li class="mb-2">
        Entrants must connect a wallet to or create an account on the Helix
        application at
        <NuxtLink
          href="https://www.helixapp.com"
          class="text-blue-500 hover:text-blue-600"
        >
          https://www.helixapp.com
        </NuxtLink>
        <span>
          (the “Application”) and engage in trading on the Application.
          Instructions for creating an account on the Application are available
          at
        </span>

        <NuxtLink
          href="https://www.helixapp.com"
          class="text-blue-500 hover:text-blue-600"
        >
          https://www.helixapp.com
        </NuxtLink>
        <span>
          . Use of the Application is subject to the terms and conditions
          located at
        </span>
        <NuxtLink
          :to="{ name: MainPage.Terms }"
          class="text-blue-500 hover:text-blue-600"
        >
          https://www.helixapp.com/terms
        </NuxtLink>
        <span>
          (the “Terms”). All trades conducted through the front end of the
          Application during the Competition Period will be included for
          purposes of the Competition. Trades conducted through the Helix API
          will not be counted. For each $100 of volume traded by an Entrant, the
          Entrant shall receive one (1) Entry in the Giveaway. An Entrant’s
          trading volume during the Competition Period, shall be determined by
          reference to the Helix Leaderboard.
        </span>
      </li>
    </ol>

    <p class="text-center font-bold my-4 uppercase">OR</p>

    <ol start="2" class="list-decimal list-inside mb-4">
      <li class="mb-2">
        Submit a form or forms at
        <NuxtLink
          href="https://docs.google.com/forms/d/1xspfjE0Gj9X1fS1vzWlyvsyZETN3yiF1yAMmCX_K5mA/"
          class="text-blue-500 hover:text-blue-600"
        >
          https://docs.google.com/forms/d/1xspfjE0Gj9X1fS1vzWlyvsyZETN3yiF1yAMmCX_K5mA/
        </NuxtLink>
        . Entrants submitting forms must identify a social media post (“Post”)
        mentioning the Competition and sharing a promotional video posted on X
        at the onset of the Competition, and will receive one Entry for every
        10,000 views each such post receives. Sponsor shall have sole
        discretion to determine the number of views a post receives.
        Entrants may submit multiple Posts and forms, by submitting a separate
        form for each Post.
      </li>
    </ol>

    <p class="mb-4">
      The Platform’s clock will be the official timekeeper for this Competition.
      All personally identifiable information collected in connection with the
      Competition will be used by Sponsor in accordance with its online privacy
      policy, located at
      <NuxtLink
        :to="{ name: MainPage.CompetitionPrivacyPolicy }"
        class="text-blue-500 hover:text-blue-600"
      >
        https://helixapp.com/competition-privacy-policy/
      </NuxtLink>
      <span>.</span>
    </p>

    <p class="mb-4">
      Any communication or information transmitted to Sponsor by electronic mail
      or otherwise is and will be treated as non-confidential and
      nonproprietary. Sponsor may engage a third-party platform or application
      provider (for ease of reference, a “Third-Party Application Provider”) to
      administer certain aspects of the Competition, including without
      limitation, the online collection of entry information. Such Third-Party
      Application Provider will provide your personally identifiable information
      to Sponsor, who will use such information in accordance with its privacy
      policy as set forth above. Third-Party Application Providers may also use
      your information for their own independent purposes in accordance with
      their own independent privacy practices. Sponsor is not responsible for
      the storage or any use of your entry information by any Third-Party
      Application Provider. You should carefully review the privacy practices of
      any third party to determine their specific privacy policies. Sponsor is
      not responsible for the storage or any use of your entry information by
      any Third-Party Application Provider.
    </p>

    <h3 class="text-lg font-bold mb-2 uppercase">
      WINNER SELECTION AND NOTIFICATION:
    </h3>
    <p class="mb-4">
      After the close of the Competition Period, the Sponsor will determine the
      PNL Winner by reference to the Helix Leaderboard. The PNL Winner will be
      the Entrant with the top-ranked PNL on the Helix Leaderboard during the
      Competition Period, subject to verification and compliance with these
      Rules.
    </p>
    <p class="mb-4">
      After the close of the Competition Period, the Sponsor will conduct a
      random drawing to determine the Giveaway winner. The odds of winning the
      Giveaway will depend on the number of eligible Entries submitted.
    </p>
    <p class="mb-4">
      Winners will be notified in the following manner, within three (3) days
      following the end of the Competition Period:
    </p>
    <p class="mb-4">
      Entrants who traded on Helix during the Competition should connect to
      Helix with their wallets after the Competition Period. If an Entrant was
      the PNL Winner or Giveaway Winner, a pop-up will appear with instructions
      for the Entrant. The Entrant is solely responsible for complying with
      these instructions.
    </p>
    <p class="mb-4">
      If an Entrant who entered the Giveaway by submitting a form is chosen as
      the Giveaway Winner, such Entrant will be notified directly by the Sponsor
      using the contact information submitted by the Entrant on his or her form
      and provided with instructions for claiming the Giveaway Prize. The
      Entrant is solely responsible for complying with these instructions.
    </p>
    <p class="mb-4">
      Entrants shall have ten (10) days from the end of the Competition Period
      to comply with the General Prize Conditions and KYC/AML Conditions set
      forth herein.
    </p>
    <p class="mb-4">
      Sponsor shall have no liability for any notification to winners that is
      lost, intercepted or not received by the potential winners for any reason.
      If a potential winner does not respond within the time required by
      Sponsor, or if the notification is returned as unclaimed or undeliverable
      to any potential winner, such potential winner will forfeit his or her
      potential prize and the entrant with the next highest PNL performance may
      be selected as an alternate PNL Winner and/or a second random drawing will
      be conducted to determine an alternate Giveaway Winner. If any potential
      winner is found to be ineligible or if he or she has not complied with
      these Rules or declines the prize for any reason, such potential winner
      will be disqualified and alternate winners may be selected, as described
      above.
    </p>

    <h3 class="text-lg font-bold mb-2 uppercase">PRIZES:</h3>
    <p class="mb-4">
      Subject to the timely return of all required documents as set forth below:
    </p>
    <p class="mb-4">
      (a) the PNL Winner will be invited to receive a prize (the “PNL Prize”) of
      an electric Mercedes Benz G-Wagon (“Vehicle”) or a cash prize of $168,000
      (the “Cash Award”). The Sponsor shall decide, in its sole to discretion,
      whether to award the PNL Winner the Vehicle or the Cash Award and such
      decision shall be final;
    </p>
    <p class="mb-4">
      (b) the Giveaway Winner will be invited to receive a prize (the “Giveaway
      Prize”) of an electric Mercedes Benz G-Wagon (“Vehicle”) or a cash prize
      of $168,000 (the “Cash Award”). The Sponsor shall decide, in its sole to
      discretion, whether to award the Giveaway Winner the Vehicle or the Cash
      Award and such decision shall be final;
    </p>

    <h3 class="text-lg font-bold mb-2 uppercase">GENERAL PRIZE CONDITIONS:</h3>
    <p class="mb-4">
      No substitution of prizes will be allowed, except Sponsor reserves the
      right in its sole discretion to substitute prizes of comparable value if
      any prize listed is unavailable, in whole or in part, for any reason.
      Prizes will be awarded only if the potential prize winner fully complies
      with these Rules. All prizes are non-assignable and non-transferable. All
      details and other restrictions of the prizes not specified in these Rules
      will be determined by Sponsor in its sole discretion. Each winner shall be
      solely responsible for all federal, state and/or local taxes, and the
      reporting consequences thereof, and for any other fees or costs associated
      with the applicable prize. The winners may be required to execute an
      Affidavit of Eligibility, including among other things a certification
      that they have complied with these Rules, a Publicity Release (where
      imposing such condition is legal), and such other documents as Sponsor may
      determine in its sole discretion (collectively “Prize Claim Documents”).
      If any potential winner fails or refuses to sign and return all Prize
      Claim Documents within ten (10) days of prize notification, the winner may
      be disqualified and an alternate winner may be selected.
    </p>
    <p class="mb-4">
      Prior to and as a mandatory pre-condition of receiving a prize, winners
      must complete all forms, documents, processes and procedures, including,
      for the avoidance of doubt, any electronic verification system or process,
      which the Sponsor determines, in its sole discretion, are reasonably
      necessary for the Sponsor to comply with applicable anti-money laundering
      and “know your customer” laws.
    </p>

    <h3 class="text-lg font-bold mb-2 uppercase">
      DISCLAIMER, RELEASE, AND LIMITATIONS OF LIABILITY:
    </h3>
    <p class="mb-4 uppercase">
      THE SPONSOR DOES NOT MAKE ANY REPRESENTATIONS OR WARRANTIES OF ANY KIND,
      EXPRESS OR IMPLIED, REGARDING THE PRIZES OR YOUR PARTICIPATION IN THE
      CONTEST. BY ENTERING THE CONTEST, EACH ENTRANT AGREES TO RELEASE AND HOLD
      HARMLESS THE SPONSOR, AND THE SPONSOR’S OFFICERS, DIRECTORS, EMPLOYEES,
      CONTRACTORS, AGENTS, ATTORNEYS, PARENTS, SUBSIDIARIES, AFFILIATES,
      SUPPLIERS, DISTRIBUTORS, ADVERTISING/PROMOTION AGENCIES, AND PRIZE
      SUPPLIERS, AND EACH OF THEIR RESPECTIVE PARENTS, AFFILIATES, AND
      SUBSIDIARIES AND EACH SUCH COMPANY’S OFFICERS, DIRECTORS, EMPLOYEES,
      CONTRACTORS, ATTORNEYS AND AGENTS (COLLECTIVELY, THE “RELEASEES”) FROM AND
      AGAINST ANY CLAIM OR CAUSE OF ACTION, INCLUDING, BUT NOT LIMITED TO,
      PERSONAL INJURY, DEATH, OR DAMAGE TO OR LOSS OF PROPERTY, ARISING OUT OF
      PARTICIPATION IN THE COMPETITION OR RECEIPT OR USE OR MISUSE OF THE
      PRIZES. FOR THE AVOIDANCE OF DOUBT, THE RELEASEES INCLUDES INJECTIVE LABS
      INC. AND ITS OFFICERS, DIRECTORS, EMPLOYEES, CONTRACTORS, AGENTS, AND
      ATTORNEYS.
    </p>
    <p class="mb-4">
      The Releasees are not and shall not be responsible for: any incorrect or
      inaccurate entry information; human error; technical malfunctions;
      failures, omission, interruption, deletion, or defect of any telephone
      network, computer online systems, computer equipment, server providers, or
      software, including any injury or damage to participant's or any other
      person's computer relating to or resulting from participation in this
      Competition; inability to access or delays in operation or transmission of
      any systems related to the Competition; entries that are processed late or
      incorrectly or are incomplete or lost due to computer or electronic
      malfunction or traffic congestion on the Internet or at any website;
      printing, typographical, human or other errors relating to or in
      connection with the Competition, including, without limitation, errors
      that may occur in connection with the administration of the Competition,
      the processing of entries, or the announcement of the prize or in any
      Competition-related materials. If, for any reason, the Competition is not
      capable of running as planned by reason of infection by computer virus,
      bugs, worms, tampering, unauthorized intervention, fraud, tampering,
      technical failures, or any other causes beyond the reasonable control of
      Sponsor which, in the sole opinion of Sponsor, corrupt or affect the
      administration, security, fairness, integrity or proper conduct of this
      Competition, Sponsor reserves the right at its sole discretion to void
      suspect entries and/or to cancel, terminate, modify or suspend the
      Competition and select the winner from among all eligible entries received
      prior to such cancellation, termination or suspension. IN NO EVENT WILL
      THE RELEASEES BE RESPONSIBLE OR LIABLE FOR ANY INJURIES, DAMAGES OR LOSSES
      TO PERSONS OR PROPERTY OF ANY KIND, INCLUDING DIRECT, INDIRECT,
      INCIDENTAL, CONSEQUENTIAL OR PUNITIVE DAMAGES THAT MAY BE CAUSED, DIRECTLY
      OR INDIRECTLY, IN WHOLE OR IN PART, BY AN ENTRANT’S PARTICIPATION IN THE
      COMPETITION OR RECEIPT OR USE OR MISUSE OF THE PRIZES.
    </p>

    <h3 class="text-lg font-bold mb-2 uppercase">ARBITRATION/CHOICE OF LAW:</h3>
    <p class="mb-4">Except where prohibited, entrants agree that</p>
    <ol class="list-[lower-roman] list-inside mb-4">
      <li class="mb-2">
        any and all disputes, claims, and causes of action arising out of or
        connected with the Competition promotion, or any prize awarded, or the
        determination of the winner shall be resolved individually, without
        resort to any form of class action;
      </li>
      <li class="mb-2">
        any and all claims, judgments and awards shall be limited to actual
        out-of-pocket costs incurred, including costs associated with entering
        the Competition promotion, but in no event attorney’s fees; and
      </li>
      <li class="mb-2">
        under no circumstances will you be permitted to obtain awards for, and
        you hereby waive all rights to claim, punitive, incidental and
        consequential damages and any other damages, other than for actual
        out-of-pocket expenses, and any and all rights to have damages
        multiplied or otherwise increased.
      </li>
    </ol>
    <p class="mb-4">
      All issues and questions concerning the construction, validity,
      interpretation and enforceability of these Official Rules, or the rights
      and obligations of entrant and Releasees in connection with the
      Competition, shall be governed by, and construed in accordance with, the
      internal laws of the State of New York, without giving effect to rules
      regarding conflicts of law. IF A CONTROVERSY OR CLAIM IS NOT RESOLVED
      DIRECTLY OR THROUGH MEDIATION, IT MUST BE RESOLVED, FINALLY AND
      EXCLUSIVELY, THROUGH ARBITRATION ADMINISTERED BY THE AMERICAN ARBITRATION
      ASSOCIATION (AAA) IN ACCORDANCE WITH ITS COMMERCIAL ARBITRATION RULES, AND
      ITS RULES FOR SELECTING AN ARBITRATOR, PROVIDED THAT THE ARBITRATOR SHALL
      BE EXPERIENCED AND LICENSED TO PRACTICE LAW IN THE STATE OF NEW YORK. ALL
      PROCEEDINGS SHALL TAKE PLACE IN NEW YORK, NEW YORK. Some jurisdictions do
      not allow for limitations on the ability to pursue class action remedies,
      or certain kinds of damages, and so these limitations may not apply to
      you.
    </p>
  </div>
</template>
