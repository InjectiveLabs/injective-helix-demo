<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    title: string
  }>(),
  {
    title: ''
  }
)

const parsedNotification = computed(() => parseNotification(props.title))

function parseNotification(notification: string) {
  const regex = /{{([\w-]+):([\\/\w.-]+)}}/g
  const parts = []
  let lastIndex = 0
  let match

  while ((match = regex.exec(notification)) !== null) {
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: notification.slice(lastIndex, match.index)
      })
    }

    parts.push({
      type: match[1],
      content: match[2]
    })

    lastIndex = regex.lastIndex
  }

  if (lastIndex < notification.length) {
    parts.push({
      type: 'text',
      content: notification.slice(lastIndex)
    })
  }

  return parts
}
</script>

<template>
  <div>
    <template v-for="(part, index) in parsedNotification" :key="index">
      <template v-if="part.type === 'text'">{{ part.content }}</template>

      <PartialsNotificationsCustomQuantity
        v-else-if="part.type === 'quantity'"
        :quantity="part.content"
      />

      <PartialsNotificationsCustomUsdPrice
        v-else-if="part.type === 'usdPrice'"
        :usd-price="part.content"
      />
    </template>
  </div>
</template>
