<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

const { data } = await useFetch('/api/stats')
const stats = computed(() => (data.value as any) || {
  exact: 0, resultOnly: 0, wrong: 0, total: 0,
  accuracy: 0, totalPoints: 0, maxStreak: 0, currentStreak: 0,
  maxPossiblePoints: 0, lastPredictions: []
})

const accuracyChart = ref<HTMLCanvasElement>()
const streakChart = ref<HTMLCanvasElement>()
let charts: Chart[] = []

function createCharts() {
  charts.forEach(c => c.destroy())
  charts = []

  // Accuracy doughnut
  if (accuracyChart.value) {
    charts.push(new Chart(accuracyChart.value, {
      type: 'doughnut',
      data: {
        labels: ['Exactas', 'Resultado', 'Incorrectas'],
        datasets: [{
          data: [stats.value.exact, stats.value.resultOnly, stats.value.wrong],
          backgroundColor: ['#10b981', '#fbbf24', '#ef4444'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        cutout: '65%',
        plugins: {
          legend: { position: 'bottom', labels: { color: 'rgba(255,255,255,0.8)', padding: 15, font: { size: 12 } } }
        }
      }
    }))
  }

  // Streak line chart
  if (streakChart.value && stats.value.lastPredictions?.length > 0) {
    const data = stats.value.lastPredictions
    charts.push(new Chart(streakChart.value, {
      type: 'line',
      data: {
        labels: data.map((_: any, i: number) => `#${i + 1}`),
        datasets: [{
          label: 'Puntos',
          data: data.map((p: any) => p.points),
          borderColor: '#10b981',
          backgroundColor: 'rgba(16,185,129,0.1)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: data.map((p: any) => p.points > 0 ? '#10b981' : '#ef4444'),
          pointRadius: 4
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: 'rgba(255,255,255,0.6)' } },
          x: { grid: { display: false }, ticks: { color: 'rgba(255,255,255,0.6)' } }
        },
        plugins: {
          legend: { display: false }
        }
      }
    }))
  }
}

onMounted(createCharts)
watch(() => stats.value, createCharts, { deep: true })

const efficiency = computed(() => {
  const s = stats.value
  if (s.maxPossiblePoints === 0) return 0
  return Math.round((s.totalPoints / s.maxPossiblePoints) * 100)
})
</script>

<template>
  <div class="min-h-screen p-4 md:p-8">
    <div class="max-w-6xl mx-auto">
      <div class="mb-8">
        <h1 class="text-4xl font-bold gradient-text mb-2">Mis Estadísticas</h1>
        <p class="text-white/60">Tu rendimiento en el Mundial 2026</p>
      </div>

      <!-- Top Stats Row -->
      <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div class="glass-card text-center py-4">
          <div class="text-3xl font-bold text-primary">{{ stats.totalPoints }}</div>
          <div class="text-xs text-white/50 uppercase tracking-wider">Puntos</div>
        </div>
        <div class="glass-card text-center py-4">
          <div class="text-3xl font-bold" :class="stats.accuracy >= 70 ? 'text-green-400' : stats.accuracy >= 40 ? 'text-yellow-400' : 'text-red-400'">
            {{ stats.accuracy }}%
          </div>
          <div class="text-xs text-white/50 uppercase tracking-wider">Precisión</div>
        </div>
        <div class="glass-card text-center py-4">
          <div class="text-3xl font-bold text-blue-400">{{ stats.total }}</div>
          <div class="text-xs text-white/50 uppercase tracking-wider">Predicciones</div>
        </div>
        <div class="glass-card text-center py-4">
          <div class="text-3xl font-bold text-purple-400">{{ stats.exact }}</div>
          <div class="text-xs text-white/50 uppercase tracking-wider">Exactas</div>
        </div>
        <div class="glass-card text-center py-4">
          <div class="text-3xl font-bold text-orange-400">{{ stats.maxStreak }}</div>
          <div class="text-xs text-white/50 uppercase tracking-wider">Mejor Racha</div>
        </div>
      </div>

      <!-- Charts Row -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div class="glass-card">
          <h3 class="text-lg font-bold mb-4">Distribución de Predicciones</h3>
          <canvas ref="accuracyChart"></canvas>
        </div>
        <div class="glass-card">
          <h3 class="text-lg font-bold mb-4">Últimas Predicciones</h3>
          <canvas ref="streakChart" v-if="stats.lastPredictions?.length"></canvas>
          <div v-else class="flex items-center justify-center h-48 text-white/40 text-sm">
            No hay predicciones aún
          </div>
        </div>
      </div>

      <!-- Detail Stats -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Progress -->
        <div class="glass-card">
          <h3 class="text-lg font-bold mb-6">Progreso</h3>
          <div class="space-y-5">
            <div>
              <div class="flex justify-between text-sm mb-2">
                <span class="text-white/70">Puntos obtenidos</span>
                <span class="text-white font-bold">{{ stats.totalPoints }} / {{ stats.maxPossiblePoints }}</span>
              </div>
              <div class="h-3 rounded-full overflow-hidden bg-dark-light">
                <div class="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
                  :style="{ width: `${efficiency}%` }"></div>
              </div>
            </div>
            <div>
              <div class="flex justify-between text-sm mb-2">
                <span class="text-white/70">Racha actual</span>
                <span class="text-white font-bold">{{ stats.currentStreak }}</span>
              </div>
              <div class="h-3 rounded-full overflow-hidden bg-dark-light">
                <div class="h-full rounded-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-500"
                  :style="{ width: `${Math.min(stats.currentStreak * 20, 100)}%` }"></div>
              </div>
            </div>
            <div>
              <div class="flex justify-between text-sm mb-2">
                <span class="text-white/70">Eficiencia</span>
                <span class="text-white font-bold">{{ efficiency }}%</span>
              </div>
              <div class="h-3 rounded-full overflow-hidden bg-dark-light">
                <div class="h-full rounded-full bg-gradient-to-r from-purple-400 to-pink-500 transition-all duration-500"
                  :style="{ width: `${efficiency}%` }"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Summary breakdown -->
        <div class="glass-card">
          <h3 class="text-lg font-bold mb-6">Desglose</h3>
          <div class="space-y-4">
            <div class="flex items-center justify-between py-3 px-4 rounded-xl bg-green-500/10 border border-green-500/20">
              <div class="flex items-center gap-3">
                <span class="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-lg">✅</span>
                <div>
                  <div class="font-bold text-green-400">Exactas</div>
                  <div class="text-xs text-white/50">Resultado perfecto</div>
                </div>
              </div>
              <div class="text-right">
                <div class="text-2xl font-bold text-green-400">{{ stats.exact }}</div>
                <div class="text-xs text-white/50">{{ stats.total > 0 ? Math.round(stats.exact/stats.total*100) : 0 }}%</div>
              </div>
            </div>

            <div class="flex items-center justify-between py-3 px-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
              <div class="flex items-center gap-3">
                <span class="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center text-lg">⚠️</span>
                <div>
                  <div class="font-bold text-yellow-400">Resultado</div>
                  <div class="text-xs text-white/50">Ganador correcto</div>
                </div>
              </div>
              <div class="text-right">
                <div class="text-2xl font-bold text-yellow-400">{{ stats.resultOnly }}</div>
                <div class="text-xs text-white/50">{{ stats.total > 0 ? Math.round(stats.resultOnly/stats.total*100) : 0 }}%</div>
              </div>
            </div>

            <div class="flex items-center justify-between py-3 px-4 rounded-xl bg-red-500/10 border border-red-500/20">
              <div class="flex items-center gap-3">
                <span class="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center text-lg">❌</span>
                <div>
                  <div class="font-bold text-red-400">Incorrectas</div>
                  <div class="text-xs text-white/50">Sin acierto</div>
                </div>
              </div>
              <div class="text-right">
                <div class="text-2xl font-bold text-red-400">{{ stats.wrong }}</div>
                <div class="text-xs text-white/50">{{ stats.total > 0 ? Math.round(stats.wrong/stats.total*100) : 0 }}%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
