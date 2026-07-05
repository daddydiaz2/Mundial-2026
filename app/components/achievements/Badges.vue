<script setup lang="ts">
defineProps<{
  badges: Array<{
    id: string
    name: string
    icon: string
    description: string
    unlocked: boolean
  }>
}>()
</script>

<template>
  <div class="glass-card">
    <h2 class="text-2xl font-bold gradient-text mb-6">Logros y Badges</h2>
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      <div v-for="badge in badges" :key="badge.id"
        class="relative p-4 rounded-xl text-center transition-all duration-300 hover:scale-105"
        :class="badge.unlocked ? 'bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/50' : 'bg-white/5 opacity-50'">
        <div class="text-3xl mb-2">{{ badge.icon }}</div>
        <h3 class="font-bold text-sm mb-1">{{ badge.name }}</h3>
        <p class="text-xs text-white/50">{{ badge.description }}</p>
        <div v-if="badge.unlocked" class="absolute -top-2 -right-2">
          <div class="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
            <span class="text-white text-xs">✓</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
