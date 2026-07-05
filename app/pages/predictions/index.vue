<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'

const worldcup = useWorldCupStore()
const predictionsStore = usePredictionsStore()

const showDialog = ref(false)
const selectedMatch = ref<any>(null)

onMounted(async () => {
  await Promise.all([worldcup.fetchAll(), predictionsStore.fetchPredictions()])
})

function openPrediction(match: any) {
  selectedMatch.value = match
  showDialog.value = true
}

async function submitPrediction(homeScore: number, awayScore: number) {
  if (!selectedMatch.value) return
  try {
    await predictionsStore.makePrediction(selectedMatch.value.id, homeScore, awayScore)
  } catch (e: any) {
    if (e.statusCode === 409) {
      await predictionsStore.updatePrediction(selectedMatch.value.id, homeScore, awayScore)
    }
  }
}

const groupMatches = computed(() => worldcup.getMatchesByType('group'))
const r32Matches = computed(() => worldcup.getMatchesByType('r32'))
const r16Matches = computed(() => worldcup.getMatchesByType('r16'))
const qfMatches = computed(() => worldcup.getMatchesByType('qf'))
const sfMatches = computed(() => worldcup.getMatchesByType('sf'))
const finalMatch = computed(() => worldcup.getMatchesByType('final')[0])
const thirdMatch = computed(() => worldcup.getMatchesByType('third')[0])
</script>

<template>
  <div class="min-h-screen p-4 md:p-8">
    <div class="max-w-7xl mx-auto">
      <div class="mb-8">
        <h1 class="text-4xl md:text-5xl font-bold gradient-text mb-2">Predicciones Mundial 2026</h1>
        <p class="text-white/60">Hacé tus predicciones y competí por el primer lugar</p>
      </div>

      <div v-if="worldcup.loading" class="text-center py-20">
        <div class="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-white/60">Cargando datos del mundial...</p>
      </div>

      <template v-else>
        <!-- Group Stage -->
        <section class="mb-10">
          <h2 class="text-2xl font-bold mb-4">Fase de Grupos</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <MatchCard v-for="match in groupMatches" :key="match.id" :match="match"
              :prediction="predictionsStore.getPrediction(match.id)" @predict="openPrediction" />
          </div>
        </section>

        <!-- Bracket -->
        <section class="mb-10">
          <LiveBracket :matches="worldcup.matches" @predict="openPrediction" />
        </section>

        <!-- Knockout -->
        <section class="mb-10">
          <h2 class="text-2xl font-bold mb-4">Eliminatorias</h2>

          <div v-if="r32Matches.length" class="mb-6">
            <h3 class="text-lg font-semibold mb-3 text-white/70">Ronda de 32</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MatchCard v-for="match in r32Matches" :key="match.id" :match="match"
                :prediction="predictionsStore.getPrediction(match.id)" @predict="openPrediction" />
            </div>
          </div>

          <div v-if="r16Matches.length" class="mb-6">
            <h3 class="text-lg font-semibold mb-3 text-white/70">Octavos</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MatchCard v-for="match in r16Matches" :key="match.id" :match="match"
                :prediction="predictionsStore.getPrediction(match.id)" @predict="openPrediction" />
            </div>
          </div>

          <div v-if="qfMatches.length" class="mb-6">
            <h3 class="text-lg font-semibold mb-3 text-white/70">Cuartos</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <MatchCard v-for="match in qfMatches" :key="match.id" :match="match"
                :prediction="predictionsStore.getPrediction(match.id)" @predict="openPrediction" />
            </div>
          </div>

          <div v-if="sfMatches.length" class="mb-6">
            <h3 class="text-lg font-semibold mb-3 text-white/70">Semifinales</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <MatchCard v-for="match in sfMatches" :key="match.id" :match="match"
                :prediction="predictionsStore.getPrediction(match.id)" @predict="openPrediction" />
            </div>
          </div>

          <div v-if="finalMatch" class="mb-6">
            <h3 class="text-lg font-semibold mb-3 text-white/70">Final</h3>
            <div class="max-w-md mx-auto">
              <MatchCard :match="finalMatch" :prediction="predictionsStore.getPrediction(finalMatch.id)" @predict="openPrediction" />
            </div>
          </div>

          <div v-if="thirdMatch" class="mb-6">
            <h3 class="text-lg font-semibold mb-3 text-white/70">Tercer Puesto</h3>
            <div class="max-w-md mx-auto">
              <MatchCard :match="thirdMatch" :prediction="predictionsStore.getPrediction(thirdMatch.id)" @predict="openPrediction" />
            </div>
          </div>
        </section>
      </template>

      <PredictionDialog v-model:open="showDialog" :match="selectedMatch" @submit="submitPrediction" />
    </div>
  </div>
</template>
