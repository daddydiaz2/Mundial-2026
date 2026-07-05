<script setup lang="ts">
const { user, isAuthenticated, logout } = useAuth()
const worldcup = useWorldCupStore()

onMounted(() => {
  worldcup.fetchAll()
})
</script>

<template>
  <div class="min-h-screen bg-[#0f172a]">
    <nav class="glass border-b border-white/10 sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <NuxtLink to="/" class="flex items-center gap-2">
          <span class="text-2xl">🏆</span>
          <span class="font-bold gradient-text hidden sm:inline">World Cup 2026</span>
        </NuxtLink>

        <div class="flex items-center gap-4">
          <NuxtLink to="/predictions" class="text-sm text-white/70 hover:text-white transition-colors">Predicciones</NuxtLink>
          <NuxtLink to="/leaderboard" class="text-sm text-white/70 hover:text-white transition-colors">Ranking</NuxtLink>
          <NuxtLink v-if="isAuthenticated" to="/stats" class="text-sm text-white/70 hover:text-white transition-colors">Stats</NuxtLink>

          <template v-if="isAuthenticated">
            <NuxtLink to="/profile" class="text-sm text-white/70 hover:text-white transition-colors">
              {{ user?.username }}
            </NuxtLink>
            <button @click="logout" class="text-sm text-white/50 hover:text-white transition-colors">Salir</button>
          </template>
          <template v-else>
            <NuxtLink to="/login" class="text-sm text-primary hover:text-primary-dark transition-colors">Iniciar Sesión</NuxtLink>
          </template>
        </div>
      </div>
    </nav>

    <main>
      <slot />
    </main>
  </div>
</template>
