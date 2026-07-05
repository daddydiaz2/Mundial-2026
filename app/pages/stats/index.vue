<script setup lang="ts">
const { data } = await useFetch('/api/stats')
const stats = computed(() => (data.value as any) || { exact: 0, resultOnly: 0, wrong: 0, total: 0, accuracy: 0, totalPoints: 0 })
</script>

<template>
  <div class="min-h-screen p-4 md:p-8">
    <div class="max-w-6xl mx-auto">
      <h1 class="text-4xl font-bold gradient-text mb-2">Mis Estadísticas</h1>
      <p class="text-white/60 mb-8">Tu rendimiento en el Mundial 2026</p>

      <!-- Quick stats -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div class="glass-card text-center">
          <div class="text-3xl font-bold text-primary">{{ stats.totalPoints }}</div>
          <div class="text-sm text-white/50">Puntos</div>
        </div>
        <div class="glass-card text-center">
          <div class="text-3xl font-bold text-green-400">{{ stats.accuracy }}%</div>
          <div class="text-sm text-white/50">Precisión</div>
        </div>
        <div class="glass-card text-center">
          <div class="text-3xl font-bold text-blue-400">{{ stats.total }}</div>
          <div class="text-sm text-white/50">Predicciones</div>
        </div>
        <div class="glass-card text-center">
          <div class="text-3xl font-bold text-purple-400">{{ stats.exact }}</div>
          <div class="text-sm text-white/50">Exactas</div>
        </div>
      </div>

      <StatsCharts :stats="stats" />
    </div>
  </div>
</template>
