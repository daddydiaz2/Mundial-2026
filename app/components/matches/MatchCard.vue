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
    group: 'Grupo', r32: 'R32', r16: 'O8',
    qf: 'C4', sf: 'Semi', final: 'FINAL', third: '3er Puesto'
  }
  return labels[props.match.type] || props.match.type
})

const phaseColor = computed(() => {
  const colors: Record<string, string> = {
    group: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    r32: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    r16: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
    qf: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    sf: 'bg-red-500/20 text-red-300 border-red-500/30',
    final: 'bg-gradient-to-r from-yellow-500/30 to-amber-500/30 text-yellow-300 border-yellow-500/30',
    third: 'bg-gray-500/20 text-gray-300 border-gray-500/30'
  }
  return colors[props.match.type] || colors.group
})

const formattedDate = computed(() => {
  try {
    const [datePart, timePart] = props.match.local_date.split(' ')
    const [month, day, year] = datePart.split('/')
    return format(new Date(`${year}-${month}-${day}T${timePart}`), 'dd MMM', { locale: es })
  } catch {
    return ''
  }
})

const formattedTime = computed(() => {
  try {
    const [, timePart] = props.match.local_date.split(' ')
    return timePart
  } catch {
    return ''
  }
})

const matchdayLabel = computed(() => {
  if (props.match.type === 'group') {
    return `Fecha ${props.match.matchday}`
  }
  return ''
})

const predictionResult = computed(() => {
  if (!props.prediction || !isFinished.value) return null
  const pred = props.prediction
  const actual = {
    home: Number(props.match.home_score),
    away: Number(props.match.away_score)
  }
  const isExact = pred.homeScore === actual.home && pred.awayScore === actual.away
  const predResult = Math.sign(pred.homeScore - pred.awayScore)
  const actualResult = Math.sign(actual.home - actual.away)
  const isCorrect = predResult === actualResult

  if (isExact) return { type: 'exact', label: '¡EXACTA!', color: 'text-green-400', bg: 'bg-green-500/20' }
  if (isCorrect) return { type: 'result', label: 'Resultado', color: 'text-yellow-400', bg: 'bg-yellow-500/20' }
  return { type: 'wrong', label: 'Fallada', color: 'text-red-400', bg: 'bg-red-500/20' }
})
</script>

<template>
  <div class="group relative rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
    :class="{
      'ring-2 ring-red-500/50 shadow-lg shadow-red-500/20': isLive,
      'ring-1 ring-white/10 hover:ring-primary/50 hover:shadow-xl hover:shadow-primary/10': !isLive
    }">

    <!-- Background gradient -->
    <div class="absolute inset-0 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl"></div>

    <!-- Live indicator bar -->
    <div v-if="isLive" class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-red-400 to-red-500 animate-pulse"></div>

    <div class="relative p-5">
      <!-- Header -->
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-2">
          <span :class="['px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border', phaseColor]">
            {{ phaseLabel }}
          </span>
          <span v-if="matchdayLabel" class="text-[10px] text-white/40">{{ matchdayLabel }}</span>
        </div>
        <div class="text-right">
          <div class="text-[10px] text-white/40 uppercase">{{ formattedDate }}</div>
          <div class="text-xs font-semibold text-white/70">{{ formattedTime }}</div>
        </div>
      </div>

      <!-- Teams -->
      <div class="flex items-center justify-between mb-5">
        <!-- Home Team -->
        <div class="flex-1 text-center">
          <div class="relative inline-block mb-2">
            <img v-if="homeTeam" :src="homeTeam.flag" :alt="homeTeam.name_en"
              class="w-14 h-14 rounded-full object-cover border-2 shadow-lg"
              :class="isFinished && Number(match.home_score) > Number(match.away_score) ? 'border-primary shadow-primary/30' : 'border-white/20'" />
          </div>
          <div class="font-bold text-sm truncate px-1">{{ match.home_team_name_en }}</div>
          <div class="text-[10px] text-white/40 font-mono">{{ homeTeam?.fifa_code }}</div>
        </div>

        <!-- Score / VS -->
        <div class="px-5 flex flex-col items-center">
          <template v-if="isFinished">
            <div class="flex items-center gap-2">
              <span class="text-3xl font-black text-white">{{ match.home_score }}</span>
              <span class="text-xl text-white/30">-</span>
              <span class="text-3xl font-black text-white">{{ match.away_score }}</span>
            </div>
          </template>
          <template v-else-if="isLive">
            <div class="flex items-center gap-2">
              <span class="text-3xl font-black text-red-400">{{ match.home_score }}</span>
              <span class="text-xl text-red-400/50">-</span>
              <span class="text-3xl font-black text-red-400">{{ match.away_score }}</span>
            </div>
            <div class="flex items-center gap-1 mt-1">
              <span class="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              <span class="text-[10px] text-red-400 font-bold uppercase tracking-wider">En Vivo</span>
            </div>
          </template>
          <template v-else>
            <div class="text-2xl font-bold text-white/20">VS</div>
          </template>
        </div>

        <!-- Away Team -->
        <div class="flex-1 text-center">
          <div class="relative inline-block mb-2">
            <img v-if="awayTeam" :src="awayTeam.flag" :alt="awayTeam.name_en"
              class="w-14 h-14 rounded-full object-cover border-2 shadow-lg"
              :class="isFinished && Number(match.away_score) > Number(match.home_score) ? 'border-primary shadow-primary/30' : 'border-white/20'" />
          </div>
          <div class="font-bold text-sm truncate px-1">{{ match.away_team_name_en }}</div>
          <div class="text-[10px] text-white/40 font-mono">{{ awayTeam?.fifa_code }}</div>
        </div>
      </div>

      <!-- Prediction result -->
      <div v-if="predictionResult" class="mb-4">
        <div :class="['flex items-center justify-center gap-2 py-2 rounded-lg', predictionResult.bg]">
          <span class="text-sm font-bold" :class="predictionResult.color">{{ predictionResult.label }}</span>
          <span v-if="prediction.points > 0" class="text-sm font-black" :class="predictionResult.color">+{{ prediction.points }} pts</span>
        </div>
      </div>

      <!-- User prediction display -->
      <div v-if="prediction && !isFinished" class="mb-4">
        <div class="flex items-center justify-center gap-2 py-2 rounded-lg bg-white/5">
          <span class="text-xs text-white/50">Tu predicción:</span>
          <span class="text-sm font-bold text-white">{{ prediction.homeScore }} - {{ prediction.awayScore }}</span>
        </div>
      </div>

      <!-- Action button -->
      <button v-if="!isFinished"
        @click="emit('predict', match)"
        :class="[
          'w-full py-3 rounded-xl font-bold text-sm transition-all active:scale-95',
          prediction
            ? 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
            : 'bg-gradient-to-r from-primary to-primary-dark text-dark hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5'
        ]">
        {{ prediction ? '✏️ Editar' : '🎯 Predecir' }}
      </button>

      <!-- Finished indicator -->
      <div v-else class="text-center">
        <span class="text-xs text-white/30 uppercase tracking-wider">Finalizado</span>
      </div>
    </div>
  </div>
</template>
