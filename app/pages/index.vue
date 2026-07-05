<script setup lang="ts">
const worldcup = useWorldCupStore()

onMounted(() => {
  if (!worldcup.teams.length) worldcup.fetchAll()
})

const totalMatches = computed(() => worldcup.matches.length)
</script>

<template>
  <div>
    <!-- Hero -->
    <section class="relative py-20 px-4 overflow-hidden">
      <div class="absolute inset-0 overflow-hidden">
        <div class="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
        <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/20 rounded-full blur-3xl animate-pulse" style="animation-delay: 1s"></div>
      </div>

      <div class="max-w-6xl mx-auto text-center relative z-10">
        <div class="mb-8 animate-float">
          <div class="inline-block p-6 rounded-full glass animate-glow">
            <span class="text-6xl">🏆</span>
          </div>
        </div>

        <h1 class="text-5xl md:text-7xl font-bold mb-6">
          <span class="gradient-text">FIFA World Cup</span>
          <br />
          <span class="text-white">2026</span>
        </h1>

        <p class="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
          Predice los resultados, competí con amigos y ganá premios increíbles.
          ¡Demostrá que sos el mejor experto en fútbol!
        </p>

        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <NuxtLink to="/register" class="px-8 py-3 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-dark font-bold text-lg transition-all hover:scale-105 hover:shadow-lg hover:shadow-primary/50 active:scale-95 text-center">
            Unirse Ahora
          </NuxtLink>
          <NuxtLink to="/predictions" class="px-8 py-3 rounded-xl glass text-white font-semibold text-lg transition-all hover:bg-white/10 active:scale-95 text-center">
            Ver Partidos
          </NuxtLink>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-3 gap-6 mt-16 max-w-3xl mx-auto">
          <div class="glass-card text-center">
            <div class="text-3xl font-bold gradient-text">{{ totalMatches || 104 }}</div>
            <div class="text-sm text-white/50">Partidos</div>
          </div>
          <div class="glass-card text-center">
            <div class="text-3xl font-bold gradient-text">48</div>
            <div class="text-sm text-white/50">Equipos</div>
          </div>
          <div class="glass-card text-center">
            <div class="text-3xl font-bold gradient-text">16</div>
            <div class="text-sm text-white/50">Estadios</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section class="py-20 px-4">
      <div class="max-w-6xl mx-auto">
        <h2 class="text-4xl font-bold text-center mb-12 gradient-text">Características</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="glass-card transition-all duration-300 hover:scale-105">
            <div class="text-4xl mb-4">📊</div>
            <h3 class="text-xl font-bold mb-2">Estadísticas Detalladas</h3>
            <p class="text-white/60">Analizá tu rendimiento con gráficos interactivos y métricas avanzadas.</p>
          </div>
          <div class="glass-card transition-all duration-300 hover:scale-105">
            <div class="text-4xl mb-4">🔔</div>
            <h3 class="text-xl font-bold mb-2">Notificaciones Push</h3>
            <p class="text-white/60">Recibí alertas en tiempo real sobre partidos y resultados.</p>
          </div>
          <div class="glass-card transition-all duration-300 hover:scale-105">
            <div class="text-4xl mb-4">🏅</div>
            <h3 class="text-xl font-bold mb-2">Logros y Badges</h3>
            <p class="text-white/60">Desbloqueá insignias especiales con tus predicciones.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="py-20 px-4">
      <div class="max-w-4xl mx-auto text-center glass-card">
        <h2 class="text-4xl font-bold mb-4 gradient-text">¿Listo para empezar?</h2>
        <p class="text-white/80 mb-8">Unite a miles de fanáticos y demostrá tu conocimiento del fútbol</p>
        <NuxtLink to="/register" class="px-8 py-3 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-dark font-bold text-lg transition-all hover:scale-105 hover:shadow-lg hover:shadow-primary/50 active:scale-95 inline-block">
          Crear Cuenta Gratis
        </NuxtLink>
      </div>
    </section>
  </div>
</template>
