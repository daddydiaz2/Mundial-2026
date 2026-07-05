<script setup lang="ts">
const { user } = useAuth()

const { data } = await useFetch('/api/leaderboard')
const leaderboard = computed(() => (data.value as any)?.leaderboard || [])
</script>

<template>
  <div class="min-h-screen p-4 md:p-8">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-4xl font-bold gradient-text mb-2">Clasificación</h1>
      <p class="text-white/60 mb-8">Los mejores predictores del Mundial 2026</p>

      <ClientOnly>
        <LeaderboardTable :users="leaderboard" :current-user-id="user?.id" />
        <template #fallback>
          <div class="text-center py-12 text-white/40">Cargando clasificación...</div>
        </template>
      </ClientOnly>
    </div>
  </div>
</template>
