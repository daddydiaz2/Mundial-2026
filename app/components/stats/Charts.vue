<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

const props = defineProps<{
  stats: { exact: number; resultOnly: number; wrong: number }
}>()

const accuracyChart = ref<HTMLCanvasElement>()
let charts: Chart[] = []

function createCharts() {
  charts.forEach(c => c.destroy())
  charts = []

  if (accuracyChart.value) {
    charts.push(new Chart(accuracyChart.value, {
      type: 'doughnut',
      data: {
        labels: ['Exactas', 'Resultado', 'Incorrectas'],
        datasets: [{
          data: [props.stats.exact, props.stats.resultOnly, props.stats.wrong],
          backgroundColor: ['#10b981', '#fbbf24', '#ef4444'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom', labels: { color: 'rgba(255,255,255,0.8)', padding: 15 } }
        }
      }
    }))
  }
}

onMounted(createCharts)
watch(() => props.stats, createCharts, { deep: true })
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div class="glass-card">
      <h3 class="text-lg font-bold mb-4">Precisión de Predicciones</h3>
      <canvas ref="accuracyChart"></canvas>
    </div>
    <div class="glass-card">
      <h3 class="text-lg font-bold mb-4">Resumen</h3>
      <div class="space-y-4">
        <div class="flex justify-between items-center">
          <span class="text-white/60">Exactas</span>
          <span class="text-green-400 font-bold">{{ stats.exact }}</span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-white/60">Resultado correcto</span>
          <span class="text-yellow-400 font-bold">{{ stats.resultOnly }}</span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-white/60">Incorrectas</span>
          <span class="text-red-400 font-bold">{{ stats.wrong }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
