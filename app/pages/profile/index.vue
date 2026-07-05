<script setup lang="ts">
const { user } = useAuth()

const { data: achievementsData } = await useFetch('/api/achievements')
const badges = computed(() => (achievementsData.value as any)?.badges || [])
</script>

<template>
  <div class="min-h-screen p-4 md:p-8">
    <div class="max-w-4xl mx-auto">
      <!-- Profile header -->
      <div class="glass-card mb-8">
        <div class="flex items-center gap-6">
          <div class="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center text-3xl font-bold border-2 border-primary/50">
            {{ user?.username?.[0]?.toUpperCase() || '?' }}
          </div>
          <div>
            <h1 class="text-2xl font-bold">{{ user?.fullName }}</h1>
            <p class="text-white/50">@{{ user?.username }}</p>
            <p class="text-sm text-white/40">{{ user?.email }}</p>
          </div>
        </div>

        <div class="grid grid-cols-3 gap-4 mt-6">
          <div class="text-center">
            <div class="text-2xl font-bold text-primary">{{ user?.totalPoints || 0 }}</div>
            <div class="text-xs text-white/50">Puntos</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-green-400">{{ user?.accuracy || 0 }}%</div>
            <div class="text-xs text-white/50">Precisión</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-blue-400">#{{ user?.rank || '-' }}</div>
            <div class="text-xs text-white/50">Ranking</div>
          </div>
        </div>
      </div>

      <Badges :badges="badges" />
    </div>
  </div>
</template>
