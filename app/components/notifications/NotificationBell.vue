<script setup lang="ts">
const { requestPermission } = useNotifications()
const isEnabled = ref(false)

onMounted(async () => {
  if ('Notification' in window) {
    isEnabled.value = Notification.permission === 'granted'
  }
})

async function enableNotifications() {
  const permission = await requestPermission()
  isEnabled.value = permission === 'granted'
}
</script>

<template>
  <button @click="enableNotifications" class="relative p-2 rounded-lg transition-all hover:bg-white/10">
    <span class="text-xl">🔔</span>
    <div v-if="!isEnabled" class="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
  </button>
</template>
