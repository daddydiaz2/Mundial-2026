<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import confetti from 'canvas-confetti'

const worldcup = useWorldCupStore()
const predictionsStore = usePredictionsStore()
const { isAuthenticated, user } = useAuth()

const showDialog = ref(false)
const selectedMatch = ref<any>(null)
const activeTab = ref('all')
const searchQuery = ref('')

onMounted(async () => {
  await worldcup.fetchAll()
  if (isAuthenticated.value) {
    await predictionsStore.fetchPredictions()
  }
})

function triggerConfetti() {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#fbbf24', '#3b82f6', '#8b5cf6', '#10b981']
  })
}

function openPrediction(match: any) {
  if (!isAuthenticated.value) {
    navigateTo('/login')
    return
  }
  selectedMatch.value = match
  showDialog.value = true
}

async function submitPrediction(homeScore: number, awayScore: number) {
  if (!selectedMatch.value) return
  try {
    await predictionsStore.makePrediction(selectedMatch.value.id, homeScore, awayScore)
    triggerConfetti()
  } catch (e: any) {
    if (e.statusCode === 409) {
      await predictionsStore.updatePrediction(selectedMatch.value.id, homeScore, awayScore)
      triggerConfetti()
    }
  }
}

const tabs = [
  { id: 'all', label: 'Todos', icon: '⚽' },
  { id: 'group', label: 'Grupos', icon: '📊' },
  { id: 'knockout', label: 'Eliminatorias', icon: '🏆' },
  { id: 'upcoming', label: 'Próximos', icon: '📅' },
  { id: 'finished', label: 'Finalizados', icon: '✅' }
]

const filteredMatches = computed(() => {
  let matches = worldcup.matches

  if (activeTab.value === 'group') {
    matches = matches.filter(m => m.type === 'group')
  } else if (activeTab.value === 'knockout') {
    matches = matches.filter(m => ['r32', 'r16', 'qf', 'sf', 'final', 'third'].includes(m.type))
  } else if (activeTab.value === 'upcoming') {
    matches = matches.filter(m => m.finished === 'FALSE' && m.time_elapsed === 'notstarted')
  } else if (activeTab.value === 'finished') {
    matches = matches.filter(m => m.finished === 'TRUE')
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    matches = matches.filter(m =>
      m.home_team_name_en.toLowerCase().includes(query) ||
      m.away_team_name_en.toLowerCase().includes(query)
    )
  }

  return matches
})

const matchStats = computed(() => ({
  total: worldcup.matches.length,
  finished: worldcup.matches.filter(m => m.finished === 'TRUE').length,
  upcoming: worldcup.matches.filter(m => m.finished === 'FALSE' && m.time_elapsed === 'notstarted').length,
  predictions: predictionsStore.predictions.length
}))
</script>

<template>
  <div class="min-h-screen">
    <!-- Hero Header -->
    <div class="relative overflow-hidden bg-gradient-to-br from-primary/10 via-transparent to-secondary/10">
      <div class="absolute inset-0">
        <div class="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        <div class="absolute bottom-0 left-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl"></div>
      </div>

      <div class="relative max-w-7xl mx-auto px-4 py-12 md:py-16">
        <div class="text-center mb-8">
          <h1 class="text-4xl md:text-6xl font-bold mb-3">
            <span class="gradient-text">Predicciones</span>
          </h1>
          <p class="text-lg text-white/60 max-w-2xl mx-auto">
            Predicí los resultados del Mundial 2026 y competí por el primer lugar
          </p>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <div class="glass-card text-center py-4">
            <div class="text-2xl font-bold text-primary">{{ matchStats.total }}</div>
            <div class="text-xs text-white/50 uppercase tracking-wider">Partidos</div>
          </div>
          <div class="glass-card text-center py-4">
            <div class="text-2xl font-bold text-green-400">{{ matchStats.finished }}</div>
            <div class="text-xs text-white/50 uppercase tracking-wider">Jugados</div>
          </div>
          <div class="glass-card text-center py-4">
            <div class="text-2xl font-bold text-blue-400">{{ matchStats.upcoming }}</div>
            <div class="text-xs text-white/50 uppercase tracking-wider">Próximos</div>
          </div>
          <div class="glass-card text-center py-4">
            <div class="text-2xl font-bold text-purple-400">{{ matchStats.predictions }}</div>
            <div class="text-xs text-white/50 uppercase tracking-wider">Predicciones</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 py-8">
      <!-- Auth Banner -->
      <div v-if="!isAuthenticated" class="glass-card mb-8 border border-primary/30">
        <div class="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 class="text-lg font-bold text-primary">¡Hacé tu primera predicción!</h3>
            <p class="text-white/60">Registrate o iniciá sesión para predecir resultados y ganar puntos</p>
          </div>
          <div class="flex gap-3">
            <NuxtLink to="/register" class="px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-dark font-bold transition-all hover:scale-105">
              Registrarse
            </NuxtLink>
            <NuxtLink to="/login" class="px-6 py-2.5 rounded-xl glass text-white font-semibold transition-all hover:bg-white/10">
              Iniciar Sesión
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="flex flex-col md:flex-row gap-4 mb-8">
        <!-- Tabs -->
        <div class="flex gap-2 overflow-x-auto pb-2 md:pb-0">
          <button v-for="tab in tabs" :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap',
              activeTab === tab.id
                ? 'bg-primary text-dark shadow-lg shadow-primary/30'
                : 'glass text-white/70 hover:text-white hover:bg-white/10'
            ]">
            <span>{{ tab.icon }}</span>
            <span>{{ tab.label }}</span>
          </button>
        </div>

        <!-- Search -->
        <div class="flex-1">
          <div class="relative">
            <input v-model="searchQuery" type="text" placeholder="Buscar equipo..."
              class="w-full px-4 py-2.5 pl-10 rounded-xl bg-white/10 border border-white/20 focus:border-primary focus:ring-2 focus:ring-primary/50 transition-all outline-none text-white placeholder-white/40" />
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">🔍</span>
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="worldcup.loading" class="text-center py-20">
        <div class="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-white/60 text-lg">Cargando datos del mundial...</p>
      </div>

      <!-- Matches Grid -->
      <div v-else-if="filteredMatches.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MatchCard v-for="match in filteredMatches" :key="match.id" :match="match"
          :prediction="predictionsStore.getPrediction(match.id)" @predict="openPrediction" />
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-20 glass-card">
        <div class="text-5xl mb-4">⚽</div>
        <h3 class="text-xl font-bold mb-2">No se encontraron partidos</h3>
        <p class="text-white/60">Intentá con otra búsqueda o filtro</p>
      </div>

      <!-- Bracket Section -->
      <section v-if="worldcup.matches.length" class="mt-12">
        <h2 class="text-3xl font-bold mb-6 gradient-text text-center">Bracket Eliminatorio</h2>
        <LiveBracket :matches="worldcup.matches" @predict="openPrediction" />
      </section>
    </div>

    <!-- Prediction Dialog -->
    <PredictionDialog v-model:open="showDialog" :match="selectedMatch" @submit="submitPrediction" />
  </div>
</template>
