<script lang="ts" setup>
import { format } from 'date-fns'
import { getExplorerUrl } from '@shared/utils/network'
import { Status, StatusType, formatWalletAddress } from '@injectivelabs/utils'
import {
  GUILD_MAX_CAP,
  GUILD_MIN_AMOUNT,
  GUILD_ENCODE_KEY,
  GUILD_HASH_CHAR_LIMIT,
  GUILD_BASE_TOKEN_SYMBOL
} from '@/app/utils/constants'
import { guildDescriptionMap } from '@/app/data/campaign'
import { toBalanceInToken, generateUniqueHash } from '@/app/utils/formatters'
import { Modal, MainPage, GuildSortBy } from '@/types'

const route = useRoute()
const modalStore = useModalStore()
const walletStore = useSharedWalletStore()
const campaignStore = useCampaignStore()
const { t } = useLang()
const { copy } = useClipboard()
const { baseToken } = useGuild()
const { $onError } = useNuxtApp()
const notificationStore = useSharedNotificationStore()

const DATE_FORMAT = 'yyyy-MM-dd hh:mm:ss'

const page = ref(1)
const limit = ref(10)
const now = ref(Date.now())
const hasNewData = ref(false)
const sortBy = ref(GuildSortBy.Volume)

const status = reactive(new Status(StatusType.Loading))
const tableStatus = reactive(new Status(StatusType.Idle))

const isMyGuild = computed(() => {
  if (!campaignStore.userGuildInfo || !campaignStore.guild) {
    return false
  }

  return campaignStore.userGuildInfo?.guildId === campaignStore.guild?.guildId
})

const isMaxCap = computed(() => campaignStore.totalGuildMember >= GUILD_MAX_CAP)

const isCampaignStarted = computed(() => {
  if (!campaignStore.guildCampaignSummary) {
    return false
  }

  return campaignStore.guildCampaignSummary.startTime < now.value
})

const isCampaignOver = computed(() => {
  if (!campaignStore.guildCampaignSummary) {
    return false
  }

  return campaignStore.guildCampaignSummary.endTime < now.value
})

const guildDescription = computed(() => {
  if (!campaignStore.guild) {
    return
  }

  return (
    campaignStore.guild.description.replace('No description', '') ||
    guildDescriptionMap[campaignStore.guild.guildId]
  )
})

const startDate = computed(() => {
  if (!campaignStore.guildCampaignSummary) {
    return
  }

  return format(campaignStore.guildCampaignSummary.startTime, 'MMM dd')
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

  return `${getExplorerUrl()}/account/${campaignStore.guild.masterAddress}`
})

const guildInvitationHash = computed(() =>
  generateUniqueHash({
    value: `${GUILD_ENCODE_KEY}${campaignStore.guild?.guildId || 0}`,
    limit: GUILD_HASH_CHAR_LIMIT
  })
)

const { valueToString: guildMasterBalance } = useSharedBigNumberFormatter(
  computed(() =>
    toBalanceInToken({
      value: campaignStore.guild?.masterBalance || 0,
      decimalPlaces: baseToken.value?.decimals || 18
    })
  )
)

onWalletConnected(() => {
  Promise.all([
    campaignStore.fetchGuildDetails({
      skip: 0,
      sortBy: sortBy.value,
      limit: limit.value,
      guildId: route.params.guild as string
    }),
    campaignStore.fetchGuildsByTVL(),
    campaignStore.fetchUserGuildInfo(),
    campaignStore.fetchUserIsOptedOutOfRewards()
  ])
    .catch((error) => {
      $onError(error)
      navigateTo({ name: MainPage.Guilds })
    })
    .finally(() => {
      status.setIdle()
    })
})

function fetchGuildDetails({ skip = 0 }: { skip: number }) {
  tableStatus.setLoading()

  campaignStore
    .fetchGuildDetails({
      skip,
      limit: limit.value,
      sortBy: sortBy.value,
      guildId: route.params.guild as string
    })
    .catch($onError)
    .finally(() => tableStatus.setIdle())
}

function onCopyInvitationLink() {
  copy(guildInvitationHash.value)
  notificationStore.success({ title: t('guild.toast.copiedInvitationLink') })
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
    Promise.all([
      campaignStore.fetchGuildsByTVL(), // refresh list of guilds logo
      campaignStore.pollGuildDetails({
        page: page.value,
        limit: limit.value,
        sortBy: sortBy.value,
        guildId: route.params.guild as string
      })
    ]),
  30 * 1000
)

watch(lastUpdated, () => {
  if (page.value === 1) {
    return
  }

  hasNewData.value = true
})

useIntervalFn(() => (now.value = Date.now()), 1000)
</script>

<template>
  <div class="h-full container p-10">
    <div class="mx-auto max-w-7xl w-full h-full px-4">
      <!-- Back -->
      <NuxtLink :to="{ name: MainPage.Guilds }" class="hover:text-blue-500">
        <div class="flex items-center gap-1">
          <SharedIcon name="arrow" is-md />
          <div>{{ $t('common.back') }}</div>
        </div>
      </NuxtLink>

      <AppHocLoading v-bind="{ status }" class="h-full">
        <div v-if="campaignStore.guild" class="text-ellipsis overflow-hidden">
          <section class="mt-4 flex justify-between flex-wrap gap-4">
            <article class="flex items-center gap-5 max-sm:flex-wrap">
              <PartialsGuildThumbnail
                is-xl
                :thumbnail-id="campaignStore.guild.logo"
              />

              <div class="overflow-hidden">
                <div class="flex items-center gap-5">
                  <h3 class="text-2xl font-semibold">
                    {{ campaignStore.guild.name }}
                  </h3>
                  <PartialsGuildStatus
                    v-bind="{
                      isCampaignStarted,
                      isActive: campaignStore.guild.isActive
                    }"
                  />
                  <div
                    v-if="isMyGuild"
                    class="px-2 py-0.5 border border-blue-500 text-blue-500 rounded text-xs"
                  >
                    {{ $t('guild.you') }}
                  </div>
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
                  <div class="flex items-center flex-wrap gap-x-1">
                    <p>{{ $t('guild.leaderboard.guildMasterBalance') }}:</p>
                    <p class="font-semibold">
                      {{ guildMasterBalance }}
                      {{ baseToken?.symbol || GUILD_BASE_TOKEN_SYMBOL }}
                    </p>
                  </div>
                  <p v-if="!campaignStore.guild.isActive" class="text-gray-500">
                    *{{
                      $t('guild.inactiveDescription', {
                        amount: GUILD_MIN_AMOUNT
                      })
                    }}
                  </p>
                </section>
              </div>
            </article>

            <template v-if="walletStore.isUserConnected">
              <AppButton
                v-if="campaignStore.userGuildInfo"
                class="bg-blue-500 text-blue-900"
                @click="onCopyInvitationLink"
              >
                <div class="flex items-center gap-1">
                  <span>{{ $t('guild.leaderboard.invitationCode') }}</span>
                  <SharedIcon name="link" is-md />
                </div>
              </AppButton>

              <AppButton
                v-else-if="isMaxCap"
                class="text-gray-600"
                :is-disabled="isMaxCap"
              >
                <div class="flex items-center gap-1">
                  <span>{{ $t('guild.joinGuild.maxCap') }}</span>
                </div>
              </AppButton>

              <AppButton
                v-else
                class="bg-blue-500 text-blue-900"
                :is-disabled="isMaxCap || campaignStore.userIsOptedOutOfReward"
                @click="onJoinGuild"
              >
                <div class="flex items-center gap-1">
                  <span>{{ $t('guild.joinGuild.cta') }}</span>
                </div>
              </AppButton>
            </template>
          </section>

          <p v-if="guildDescription" class="mt-8">
            {{ guildDescription }}
          </p>

          <PartialsGuildStats v-bind="{ isCampaignStarted }" />
          <PartialsGuildReward v-bind="{ isCampaignOver, now }" />

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
                  <SharedIcon
                    name="refresh"
                    class="text-blue-500 hover:opacity-80 cursor-pointer"
                    @click="onRefresh"
                  />
                </AppTooltip>
              </div>
            </div>

            <AppHocLoading
              class="overflow-y-hidden mt-6"
              :status="tableStatus"
              :class="[
                isCampaignStarted ? 'overflow-x-auto' : 'overflow-x-hidden'
              ]"
              :loader-class="
                tableStatus.isLoading() ? 'min-h-xs items-center' : ''
              "
            >
              <section class="relative">
                <div
                  v-if="startDate && !isCampaignStarted"
                  class="absolute inset-0 flex items-center justify-center rounded-lg backdrop-filter backdrop-blur bg-gray-900 bg-opacity-40"
                >
                  <p class="font-semibold">
                    {{ $t('guild.startOn', { date: startDate }) }}
                  </p>
                </div>

                <table class="w-full">
                  <thead>
                    <tr class="border-b uppercase text-xs text-gray-500">
                      <th class="p-4 text-left">
                        {{ $t('guild.leaderboard.table.rank') }}
                      </th>
                      <th class="p-4 text-left">
                        {{ $t('guild.leaderboard.table.address') }}
                      </th>

                      <AppSortableHeaderItem
                        v-model:sort-by="sortBy"
                        class="justify-end px-1.5"
                        :is-ascending="sortBy !== GuildSortBy.TVL"
                        :value="GuildSortBy.TVL"
                        @sortBy:changed="onRefresh"
                      >
                        <CommonHeaderTooltip
                          v-bind="{
                            tooltip: $t(
                              'guild.leaderboard.table.tiaBalanceTooltip'
                            )
                          }"
                        >
                          <span class="whitespace-nowrap">
                            {{
                              $t(
                                'guild.leaderboard.table.weightedAverageTiaBalance'
                              )
                            }}
                          </span>
                        </CommonHeaderTooltip>
                      </AppSortableHeaderItem>

                      <AppSortableHeaderItem
                        v-model:sort-by="sortBy"
                        class="justify-end px-1.5"
                        :is-ascending="sortBy !== GuildSortBy.Volume"
                        :value="GuildSortBy.Volume"
                        @sortBy:changed="onRefresh"
                      >
                        <CommonHeaderTooltip
                          v-bind="{
                            tooltip: $t('guild.leaderboard.table.volumeTooltip')
                          }"
                        >
                          <span class="whitespace-nowrap">
                            {{ $t('guild.leaderboard.table.tradingVolume') }}
                          </span>
                        </CommonHeaderTooltip>
                      </AppSortableHeaderItem>
                    </tr>
                  </thead>
                  <tbody>
                    <PartialsGuildMemberRow
                      v-for="(member, index) in campaignStore.guildMembers"
                      :key="member.address"
                      v-bind="{
                        member,
                        isCampaignStarted,
                        rank: (page - 1) * limit + index + 1
                      }"
                    />
                  </tbody>
                </table>
              </section>
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
              guild: campaignStore.guild,
              isDisabled: isMaxCap || campaignStore.userIsOptedOutOfReward
            }"
          />
        </div>
      </AppHocLoading>
    </div>
  </div>
</template>
