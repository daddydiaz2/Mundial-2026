<script setup lang="ts">
const { user, isAuthenticated, isAdmin, logout, fetchUser } = useAuth()
const worldcup = useWorldCupStore()

onMounted(() => {
  fetchUser()
  worldcup.fetchAll()
})
</script>

<template>
  <div class="min-h-screen bg-[#0f172a]">
    <nav class="glass border-b border-white/10 sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <NuxtLink
          to="/"
          class="flex items-center gap-2"
        >
          <span class="text-2xl">🏆</span>
          <div class="hidden sm:block">
            <span class="font-bold gradient-text">World Cup 2026</span>
            <span class="block text-[10px] text-white/30 tracking-widest uppercase -mt-1">Grupo Genexus</span>
          </div>
        </NuxtLink>

        <div class="flex items-center gap-4">
          <NuxtLink
            to="/partidos"
            class="text-sm text-white/70 hover:text-white transition-colors"
          >Partidos</NuxtLink>
          <NuxtLink
            to="/posiciones"
            class="text-sm text-white/70 hover:text-white transition-colors"
          >Posiciones</NuxtLink>
          <NuxtLink
            to="/leaderboard"
            class="text-sm text-white/70 hover:text-white transition-colors"
          >Ranking</NuxtLink>

          <!-- Predicciones — animated CTA, only for authenticated users -->
          <Transition name="predict">
            <NuxtLink
              v-if="isAuthenticated"
              to="/predictions"
              class="predict-cta predict-shimmer group relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-bold overflow-hidden hover:scale-105 active:scale-95 transition-transform duration-300"
            >
              <span class="absolute inset-0 bg-gradient-to-r from-primary via-primary-dark to-secondary" />
              <span class="relative z-10 flex items-center gap-1.5 text-dark">
                <span class="text-base transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110">🎯</span>
                <span>Predicciones</span>
              </span>
              <span class="predict-dot absolute top-0.5 right-1 w-2 h-2 rounded-full bg-white ring-2 ring-primary-dark" />
            </NuxtLink>
          </Transition>

          <NuxtLink
            v-if="isAuthenticated"
            to="/stats"
            class="text-sm text-white/70 hover:text-white transition-colors"
          >Stats</NuxtLink>
          <NuxtLink
            v-if="isAdmin"
            to="/admin"
            class="text-sm text-red-400 hover:text-red-300 transition-colors"
          >Admin</NuxtLink>

          <template v-if="isAuthenticated">
            <NotificationBell />
            <NuxtLink
              to="/profile"
              class="text-sm text-white/70 hover:text-white transition-colors"
            >
              {{ user?.username }}
            </NuxtLink>
            <button
              class="text-sm text-white/50 hover:text-white transition-colors"
              @click="logout"
            >
              Salir
            </button>
          </template>
          <template v-else>
            <NuxtLink
              to="/login"
              class="text-sm text-primary hover:text-primary-dark transition-colors"
            >Iniciar Sesión</NuxtLink>
          </template>
        </div>
      </div>
    </nav>

    <main>
      <slot />
    </main>
  </div>
</template>
