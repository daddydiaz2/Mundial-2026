<script setup lang="ts">
import { computed } from 'vue'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const props = defineProps<{
  match: any
  prediction?: any
}>()

const emit = defineEmits<{ predict: [match: any] }>()

const worldcup = useWorldCupStore()

const homeTeam = computed(() => worldcup.getTeam(props.match.home_team_id))
const awayTeam = computed(() => worldcup.getTeam(props.match.away_team_id))

const isFinished = computed(() => props.match.finished === 'TRUE')
const isLive = computed(() => !isFinished.value && props.match.time_elapsed !== 'notstarted')

const phaseLabel = computed(() => {
  const labels: Record<string, string> = {
    group: 'Fase de Grupos', r32: 'Ronda de 32', r16: 'Octavos',
    qf: 'Cuartos', sf: 'Semifinal', final: 'Final', third: 'Tercer Puesto'
  }
  return labels[props.match.type] || props.match.type
})

const formattedDate = computed(() => {
  try {
    const [datePart, timePart] = props.match.local_date.split(' ')
    const [month, day, year] = datePart.split('/')
    return format(new Date(`${year}-${month}-${day}T${timePart}`), 'dd MMM yyyy - HH:mm', { locale: es })
  } catch {
    return props.match.local_date
  }
})
</script>

<template>
  <div class="glass-card relative overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
    :class="{ 'border-2 border-red-500/50': isLive }">

    <!-- Phase badge -->
    <div class="absolute top-3 right-3">
      <span class="px-2 py-0.5 rounded-full text-xs font-bold bg-white/10 text-white/60">{{ phaseLabel }}</span>
    </div>

    <!-- Date -->
    <div class="text-xs text-white/50 mb-4">{{ formattedDate }}</div>

    <!-- Teams -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex-1 text-center">
        <img v-if="homeTeam" :src="homeTeam.flag" :alt="homeTeam.name_en"
          class="w-12 h-12 rounded-full mx-auto mb-2 border-2 border-white/20" />
        <div class="font-bold text-sm">{{ match.home_team_name_en }}</div>
        <div class="text-xs text-white/50">{{ homeTeam?.fifa_code }}</div>
      </div>

      <div class="px-6">
        <template v-if="isFinished">
          <div class="text-3xl font-bold gradient-text">{{ match.home_score }} - {{ match.away_score }}</div>
        </template>
        <template v-else-if="isLive">
          <div class="text-2xl font-bold text-red-500 animate-pulse">{{ match.home_score }} - {{ match.away_score }}</div>
          <div class="text-xs text-red-400 text-center">EN VIVO</div>
        </template>
        <template v-else>
          <div class="text-xl font-bold text-white/30">VS</div>
        </template>
      </div>

      <div class="flex-1 text-center">
        <img v-if="awayTeam" :src="awayTeam.flag" :alt="awayTeam.name_en"
          class="w-12 h-12 rounded-full mx-auto mb-2 border-2 border-white/20" />
        <div class="font-bold text-sm">{{ match.away_team_name_en }}</div>
        <div class="text-xs text-white/50">{{ awayTeam?.fifa_code }}</div>
      </div>
    </div>

    <!-- Prediction display -->
    <div v-if="prediction && !isFinished" class="text-center mb-3 text-sm text-white/60">
      Tu predicción: <span class="font-bold text-white">{{ prediction.homeScore }} - {{ prediction.awayScore }}</span>
    </div>

    <!-- Scoring -->
    <div v-if="prediction && isFinished" class="text-center mb-3">
      <span :class="prediction.points > 0 ? 'text-green-400' : 'text-red-400'" class="text-sm font-bold">
        {{ prediction.points > 0 ? `+${prediction.points} pts` : '0 pts' }}
      </span>
    </div>

    <!-- Action button -->
    <button v-if="!isFinished && !prediction"
      @click="emit('predict', match)"
      class="w-full py-2.5 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-dark font-bold transition-all hover:scale-105 active:scale-95">
      Hacer Predicción
    </button>
    <button v-else-if="!isFinished && prediction"
      @click="emit('predict', match)"
      class="w-full py-2.5 rounded-xl bg-white/10 text-white/60 font-semibold transition-all hover:bg-white/20">
      Editar Predicción
    </button>
  </div>
</template>
