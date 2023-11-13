<script lang="ts" setup>
import { format } from 'date-fns'
import { Status, StatusType, formatWalletAddress } from '@injectivelabs/utils'
import { getExplorerUrl } from '@injectivelabs/sdk-ui-ts'
import {
  NETWORK,
  GUILD_ENCODE_KEY,
  GUILD_HASH_CHAR_LIMIT,
  GUILD_BASE_TOKEN_SYMBOL
} from 'app/utils/constants'
import { toBalanceInToken, generateUniqueHash } from '@/app/utils/formatters'
import { Modal, MainPage } from '@/types'

const route = useRoute()
const modalStore = useModalStore()
const walletStore = useWalletStore()
const campaignStore = useCampaignStore()
const { t } = useLang()
const { copy } = useClipboard()
const { baseToken } = useGuild()
const { $onError } = useNuxtApp()
const { success } = useNotifications()

const DATE_FORMAT = 'yyyy-MM-dd hh:mm:ss'

const page = ref(1)
const limit = ref(10)
const date = ref(Date.now())
const hasNewData = ref(false)

const status = reactive(new Status(StatusType.Loading))
const tableStatus = reactive(new Status(StatusType.Idle))

const isCampaignStarted = computed(() => {
  if (!campaignStore.guildCampaignSummary) {
    return false
  }

  return campaignStore.guildCampaignSummary.startTime < date.value
})

const lastUpdated = computed(() => {
  if (!campaignStore.guild) {
    return
  }

  return format(campaignStore.guild.updatedAt, DATE_FORMAT)
})

const explorerLink = computed(() => {
  if (!campaignStore.guild) {
    return
  }

  return `${getExplorerUrl(NETWORK)}/account/${
    campaignStore.guild.masterAddress
  }`
})

const guildInvitationHash = computed(() =>
  generateUniqueHash({
    value: `${GUILD_ENCODE_KEY}${campaignStore.guild?.guildId || 0}`,
    limit: GUILD_HASH_CHAR_LIMIT
  })
)

const { valueToString: guildMasterBalance } = useBigNumberFormatter(
  computed(() =>
    toBalanceInToken({
      value: campaignStore.guild?.masterBalance || 0,
      decimalPlaces: baseToken.value?.decimals || 18
    })
  )
)

const invitationLink = computed(
  () => `${document.URL}/?invite=${guildInvitationHash.value}`
)

onWalletConnected(() => {
  Promise.all([
    campaignStore.fetchGuildDetails({
      skip: 0,
      limit: limit.value,
      guildId: route.params.guild as string
    }),
    campaignStore.fetchGuildsByTVL(),
    campaignStore.fetchUserGuildInfo()
  ])
    .catch((error) => {
      $onError(error)
      navigateTo({ name: MainPage.Guilds })
    })
    .finally(() => status.setIdle())
})

function fetchGuildDetails({ skip }: { skip: number }) {
  tableStatus.setLoading()

  campaignStore
    .fetchGuildDetails({
      skip,
      limit: limit.value,
      guildId: route.params.guild as string
    })
    .catch($onError)
    .finally(() => tableStatus.setIdle())
}

function onCopyInvitationLink() {
  copy(invitationLink.value)
  success({ title: t('guild.toast.copiedInvitationLink') })
}

function onRefresh() {
  page.value = 1
  fetchGuildDetails({ skip: 0 })

  hasNewData.value = false
}

function onLimitChange(value: number) {
  page.value = 1
  limit.value = Number(value)

  fetchGuildDetails({ skip: 0 })
}

function onPageChange(value: number) {
  page.value = value

  fetchGuildDetails({ skip: (Number(page.value) - 1) * limit.value })
}

function onJoinGuild() {
  modalStore.openModal(Modal.VerifyJoinGuildHash)
}

useIntervalFn(
  () =>
    campaignStore.pollGuildDetails({
      skip: 0,
      limit: limit.value,
      guildId: route.params.guild as string
    }),
  30 * 1000
)

watch(lastUpdated, () => {
  if (page.value === 1) {
    return
  }

  hasNewData.value = true
})

useIntervalFn(() => (date.value = Date.now()), 1000)
</script>

<template>
  <div class="h-full container p-10">
    <div class="mx-auto max-w-7xl w-full h-full px-4">
      <!-- Back -->
      <NuxtLink :to="{ name: MainPage.Guilds }" class="hover:text-blue-500">
        <div class="flex items-center gap-1">
          <BaseIcon name="arrow" is-md />
          <div>{{ $t('common.back') }}</div>
        </div>
      </NuxtLink>

      <AppHocLoading v-bind="{ status }" class="h-full">
        <div v-if="campaignStore.guild" class="text-ellipsis overflow-hidden">
          <section class="mt-4 flex justify-between flex-wrap gap-4">
            <article class="flex items-center gap-5">
              <PartialsGuildThumbnail
                is-xl
                :thumbnail-id="campaignStore.guild.logo"
              />

              <div class="overflow-hidden">
                <div class="flex items-center gap-5">
                  <h3 class="text-2xl font-semibold">
                    {{ campaignStore.guild.name }}
                  </h3>
                  <AppDotStatus
                    v-if="isCampaignStarted"
                    :is-active="campaignStore.guild.isActive"
                  />
                  <AppDotStatus v-else color="text-orange-500">
                    {{ $t('common.ready') }}
                  </AppDotStatus>
                </div>
                <section class="text-sm mt-2">
                  <NuxtLink
                    :to="explorerLink"
                    target="_blank"
                    class="gap-1 flex flex-wrap"
                  >
                    <p class="whitespace-nowrap">
                      {{ $t('guild.leaderboard.guildMasterAddress') }}:
                    </p>
                    <p class="text-blue-500">
                      <span class="sm:hidden">
                        {{
                          formatWalletAddress(campaignStore.guild.masterAddress)
                        }}
                      </span>
                      <span class="max-sm:hidden">
                        {{ campaignStore.guild.masterAddress }}
                      </span>
                    </p>
                  </NuxtLink>
                  <div class="flex items-center flex-wrap gap-1">
                    <p>{{ $t('guild.leaderboard.guildMasterBalance') }}:</p>
                    <p class="font-semibold">
                      {{ guildMasterBalance }}
                      {{ baseToken?.symbol || GUILD_BASE_TOKEN_SYMBOL }}
                    </p>
                  </div>
                </section>
              </div>
            </article>

            <template v-if="walletStore.isUserWalletConnected">
              <AppButton
                v-if="campaignStore.userGuildInfo"
                class="bg-blue-500 text-white"
                @click="onCopyInvitationLink"
              >
                <div class="flex items-center gap-1">
                  <span>{{ $t('guild.leaderboard.invitationCode') }}</span>
                  <BaseIcon name="link" is-md />
                </div>
              </AppButton>

              <AppButton
                v-else
                class="bg-blue-500 text-white"
                @click="onJoinGuild"
              >
                <div class="flex items-center gap-1">
                  <span>{{ $t('guild.joinGuild.cta') }}</span>
                </div>
              </AppButton>
            </template>
          </section>

          <PartialsGuildStats v-bind="{ isCampaignStarted }" />

          <section class="pt-8 pb-4 px-6">
            <div class="flex items-center justify-between flex-wrap">
              <h3 class="font-bold">
                {{ $t('guild.leaderboard.guildMembers') }}
              </h3>

              <div v-if="lastUpdated" class="flex items-center gap-2">
                <p class="text-gray-300 text-xs">
                  {{
                    $t('guild.leaderboard.lastUpdated', { date: lastUpdated })
                  }}
                </p>
                <AppTooltip
                  v-if="hasNewData"
                  :content="$t('guild.leaderboard.fetchNewData')"
                >
                  <BaseIcon
                    name="refresh"
                    class="text-blue-500 hover:opacity-80 cursor-pointer"
                    @click="onRefresh"
                  />
                </AppTooltip>
              </div>
            </div>

            <AppHocLoading
              class="overflow-x-auto overflow-y-hidden mt-6"
              :status="tableStatus"
              :loader-class="
                tableStatus.isLoading() ? 'min-h-xs items-center' : ''
              "
            >
              <table class="w-full">
                <thead>
                  <tr class="border-b uppercase text-xs text-gray-500">
                    <th class="p-4 text-left">
                      {{ $t('guild.leaderboard.table.address') }}
                    </th>
                    <th class="p-4 text-right">
                      <CommonHeaderTooltip
                        :tooltip="
                          $t('guild.leaderboard.table.tiaBalanceTooltip')
                        "
                      >
                        <span>
                          {{
                            $t(
                              'guild.leaderboard.table.weightedAverageTiaBalance'
                            )
                          }}
                        </span>
                      </CommonHeaderTooltip>
                    </th>
                    <th class="p-4 text-right">
                      <CommonHeaderTooltip
                        :tooltip="$t('guild.leaderboard.table.volumeTooltip')"
                      >
                        <span>
                          {{ $t('guild.leaderboard.table.tradingVolume') }}
                        </span>
                      </CommonHeaderTooltip>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <PartialsGuildMemberRow
                    v-for="member in campaignStore.guildMembers"
                    :key="member.address"
                    v-bind="{ member, isCampaignStarted }"
                  />
                </tbody>
              </table>
            </AppHocLoading>
          </section>

          <AppPagination
            v-if="campaignStore.totalGuildMember > 0"
            class="pb-10 mt-6"
            v-bind="{ limit, page, totalCount: campaignStore.totalGuildMember }"
            @update:limit="onLimitChange"
            @update:page="onPageChange"
          />

          <PartialsGuildModalsAlreadyJoinedGuild />
          <PartialsGuildModalsVerifyJoinGuildHash
            :invitation-hash="guildInvitationHash"
          />
          <PartialsGuildModalsJoinGuild
            v-if="campaignStore.guild"
            v-bind="{
              limit,
              guildInvitationHash,
              guild: campaignStore.guild
            }"
          />
        </div>
      </AppHocLoading>
    </div>
  </div>
</template>
