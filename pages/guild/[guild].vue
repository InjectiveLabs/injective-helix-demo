<script lang="ts" setup>
import { format } from 'date-fns'
import { Status, StatusType } from '@injectivelabs/utils'
import { getExplorerUrl } from '@injectivelabs/sdk-ui-ts'
import {
  NETWORK,
  GUILD_ENCODE_KEY,
  GUILD_HASH_CHAR_LIMIT,
  GUILD_BASE_TOKEN_SYMBOL
} from 'app/utils/constants'
import { generateUniqueHash } from '@/app/utils/formatters'
import { MainPage } from '@/types'

const route = useRoute()
const tokenStore = useTokenStore()
const campaignStore = useCampaignStore()
const { t } = useLang()
const { copy } = useClipboard()
const { $onError } = useNuxtApp()
const { success } = useNotifications()

const DATE_FORMAT = 'yyyy-MM-dd hh:mm:ss'

const page = ref(1)
const limit = ref(10)
const hasNewData = ref(false)

const status = reactive(new Status(StatusType.Loading))
const tableStatus = reactive(new Status(StatusType.Idle))

const baseToken = computed(() =>
  tokenStore.tokens.find(({ symbol }) => symbol === GUILD_BASE_TOKEN_SYMBOL)
)

// todo change createdAt to lastUpdated once indexer fixes this bug
const lastUpdated = computed(() => {
  if (!campaignStore.guild) {
    return
  }

  return format(campaignStore.guild.createdAt, DATE_FORMAT)
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
        <div v-if="campaignStore.guild">
          <section class="mt-4 flex items-center justify-between flex-wrap">
            <article class="flex items-center gap-5">
              <PartialsGuildThumbnail
                is-xl
                :thumbnail-id="campaignStore.guild.logo"
              />

              <div>
                <div class="flex items-center">
                  <h3 class="text-2xl font-semibold">
                    {{ campaignStore.guild.name }}
                  </h3>
                  <AppDotStatus
                    class="ml-5"
                    v-bind="{ isActive: campaignStore.guild.isActive }"
                  />
                </div>
                <NuxtLink :to="explorerLink" target="_blank">
                  <p class="text-sm text-blue-500 mt-1 truncate">
                    {{ campaignStore.guild.masterAddress }}
                  </p>
                </NuxtLink>
              </div>
            </article>

            <AppButton
              class="bg-blue-500 text-white"
              @click="onCopyInvitationLink"
            >
              <div class="flex items-center gap-1">
                <span>{{ $t('guild.leaderboard.invitationLink') }}</span>
                <BaseIcon name="link" is-md />
              </div>
            </AppButton>
          </section>

          <PartialsGuildStats v-bind="{ token: baseToken }" />

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
                    v-bind="{ member }"
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
