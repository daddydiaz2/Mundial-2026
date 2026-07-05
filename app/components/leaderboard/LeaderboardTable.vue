<script setup lang="ts">
defineProps<{
  users: Array<{
    rank: number
    id: number
    username: string
    fullName: string
    avatar: string
    totalPoints: number
    accuracy: number
  }>
  currentUserId?: number
}>()

function medalIcon(rank: number) {
  if (rank === 1) return '🥇'
  if (rank === 2) return '🥈'
  if (rank === 3) return '🥉'
  return rank.toString()
}
</script>

<template>
  <div class="glass-card">
    <div class="space-y-3">
      <div v-for="player in users" :key="player.id"
        class="flex items-center gap-4 p-4 rounded-xl transition-all duration-300 hover:bg-white/5"
        :class="{
          'bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border border-yellow-500/50': player.rank === 1,
          'bg-gradient-to-r from-gray-400/20 to-gray-500/20 border border-gray-400/50': player.rank === 2,
          'bg-gradient-to-r from-orange-600/20 to-orange-700/20 border border-orange-600/50': player.rank === 3,
          'ring-2 ring-primary/50': player.id === currentUserId
        }">

        <!-- Rank -->
        <div class="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 font-bold">
          {{ medalIcon(player.rank) }}
        </div>

        <!-- Avatar -->
        <div class="flex-shrink-0">
          <div class="w-10 h-10 rounded-full overflow-hidden border-2 border-white/20 bg-white/10 flex items-center justify-center">
            <span class="text-lg">{{ player.username[0].toUpperCase() }}</span>
          </div>
        </div>

        <!-- Info -->
        <div class="flex-1 min-w-0">
          <div class="font-bold truncate">{{ player.fullName }}</div>
          <div class="text-sm text-white/50">@{{ player.username }}</div>
        </div>

        <!-- Points -->
        <div class="text-right">
          <div class="text-xl font-bold text-primary">{{ player.totalPoints }}</div>
          <div class="text-xs text-white/50">pts</div>
        </div>
      </div>
    </div>
  </div>
</template>
