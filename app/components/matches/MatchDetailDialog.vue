<script setup lang="ts">
import { computed } from 'vue'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const props = defineProps<{
  match: any | null
  open: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const worldcup = useWorldCupStore()

const homeTeam = computed(() => match.value ? worldcup.getTeam(match.value.home_team_id) : null)
const awayTeam = computed(() => match.value ? worldcup.getTeam(match.value.away_team_id) : null)

const match = computed(() => props.match)

const stadium = computed(() => {
  if (!match.value) return null
  return worldcup.stadiums.find((s: any) => s.id === match.value.stadium_id) || null
})

const isFinished = computed(() => match.value?.finished === 'TRUE')
const isUpcoming = computed(() => match.value?.time_elapsed === 'notstarted' && match.value?.finished !== 'TRUE')

const phaseLabel = computed(() => {
  const labels: Record<string, string> = {
    group: 'Fase de Grupos', r32: 'Ronda de 32', r16: 'Octavos de Final',
    qf: 'Cuartos de Final', sf: 'Semifinal', final: 'Gran Final', third: 'Tercer Puesto'
  }
  return labels[match.value?.type] || ''
})

function parseScorers(scorersStr: string) {
  if (!scorersStr || scorersStr === 'null') return []
  try {
    // Handle both JSON array format and the unusual format with special quotes
    const cleaned = scorersStr.replace(/["""]/g, '"')
    return JSON.parse(cleaned)
  } catch {
    return []
  }
}

const homeScorers = computed(() => match.value ? parseScorers(match.value.home_scorers) : [])
const awayScorers = computed(() => match.value ? parseScorers(match.value.away_scorers) : [])

function formatMatchDate(dateStr: string) {
  try {
    const [datePart, timePart] = dateStr.split(' ')
    const [m, d, y] = datePart.split('/')
    return format(new Date(`${y}-${m}-${d}T${timePart}`), "EEEE, d 'de' MMMM 'del' yyyy", { locale: es })
  } catch {
    return dateStr
  }
}

function formatMatchTime(dateStr: string) {
  try {
    const [, timePart] = dateStr.split(' ')
    return timePart
  } catch {
    return ''
  }
}

const streamingSites = [
  { name: 'FIFA+', url: 'https://www.fifa.com/fifaplus/en/tournaments/mens/worldcup/canadamexicousa2026', icon: '🌍' },
  { name: 'YouTube FIFA', url: 'https://www.youtube.com/@FIFA', icon: '📺' },
]

const flagEmoji: Record<string, string> = {
  'US': '🇺🇸', 'MX': '🇲🇽', 'CA': '🇨🇦', 'GB': '🇬🇧',
  'AR': '🇦🇷', 'BR': '🇧🇷', 'DE': '🇩🇪', 'FR': '🇫🇷',
  'ES': '🇪🇸', 'IT': '🇮🇹', 'NL': '🇳🇱', 'PT': '🇵🇹',
  'JP': '🇯🇵', 'KR': '🇰🇷', 'CN': '🇨🇳', 'AU': '🇦🇺',
}

function getCountryFlag(countryName: string) {
  const map: Record<string, string> = {
    'United States': '🇺🇸', 'Mexico': '🇲🇽', 'Canada': '🇨🇦'
  }
  return map[countryName] || '🏟️'
}
</script>

<template>
  <UModal :open="open" @update:open="emit('update:open', $event)" :ui="{ width: 'max-w-2xl' }">
    <template v-if="match">
      <div class="p-2">
        <!-- Header -->
        <div class="text-center mb-6">
          <div class="text-xs font-bold uppercase tracking-widest mb-2 text-white/50">{{ phaseLabel }}</div>
          <div class="text-sm text-white/50">{{ formatMatchDate(match.local_date) }} · {{ formatMatchTime(match.local_date) }}</div>
        </div>

        <!-- Teams & Score -->
        <div class="flex items-center justify-center gap-6 mb-8">
          <!-- Home -->
          <div class="flex-1 text-center">
            <img v-if="homeTeam" :src="homeTeam.flag" :alt="homeTeam.name_en"
              class="w-20 h-20 rounded-full mx-auto mb-3 border-2 shadow-lg"
              :class="isFinished && Number(match.home_score) > Number(match.away_score) ? 'border-primary shadow-primary/30' : 'border-white/20'" />
            <div v-else class="w-20 h-20 rounded-full mx-auto mb-3 bg-white/10 flex items-center justify-center text-2xl">❓</div>
            <h3 class="text-lg font-bold">{{ match.home_team_name_en }}</h3>
            <p class="text-sm text-white/50">{{ homeTeam?.fifa_code || '' }}</p>
          </div>

          <!-- Score -->
          <div class="text-center">
            <template v-if="isFinished">
              <div class="text-5xl font-black gradient-text">{{ match.home_score }} - {{ match.away_score }}</div>
            </template>
            <template v-else-if="!isUpcoming">
              <div class="text-4xl font-black text-red-400 animate-pulse">{{ match.home_score }} - {{ match.away_score }}</div>
              <div class="flex items-center justify-center gap-1 mt-1">
                <span class="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                <span class="text-xs text-red-400 font-bold">EN VIVO</span>
              </div>
            </template>
            <template v-else>
              <div class="text-3xl font-bold text-white/30">VS</div>
            </template>
          </div>

          <!-- Away -->
          <div class="flex-1 text-center">
            <img v-if="awayTeam" :src="awayTeam.flag" :alt="awayTeam.name_en"
              class="w-20 h-20 rounded-full mx-auto mb-3 border-2 shadow-lg"
              :class="isFinished && Number(match.away_score) > Number(match.home_score) ? 'border-primary shadow-primary/30' : 'border-white/20'" />
            <div v-else class="w-20 h-20 rounded-full mx-auto mb-3 bg-white/10 flex items-center justify-center text-2xl">❓</div>
            <h3 class="text-lg font-bold">{{ match.away_team_name_en }}</h3>
            <p class="text-sm text-white/50">{{ awayTeam?.fifa_code || '' }}</p>
          </div>
        </div>

        <!-- Goal Scorers -->
        <div v-if="isFinished && (homeScorers.length || awayScorers.length)" class="glass rounded-xl p-4 mb-6">
          <h4 class="text-sm font-bold text-white/70 mb-3">⚽ Goles</h4>
          <div class="space-y-2">
            <div v-for="scorer in homeScorers" :key="scorer" class="flex items-center gap-2 text-sm">
              <span class="text-green-400">⚽</span>
              <span class="font-medium">{{ match.home_team_name_en }}</span>
              <span class="text-white/60">{{ scorer }}</span>
            </div>
            <div v-for="scorer in awayScorers" :key="scorer" class="flex items-center gap-2 text-sm">
              <span class="text-blue-400">⚽</span>
              <span class="font-medium">{{ match.away_team_name_en }}</span>
              <span class="text-white/60">{{ scorer }}</span>
            </div>
          </div>
        </div>

        <!-- Match Info -->
        <div class="glass rounded-xl p-4 mb-6">
          <h4 class="text-sm font-bold text-white/70 mb-3">📋 Detalles del Partido</h4>
          <div class="grid grid-cols-2 gap-y-3 text-sm">
            <div class="text-white/50">Tipo</div>
            <div class="font-medium text-right">{{ phaseLabel }}</div>

            <div class="text-white/50">Grupo/Ronda</div>
            <div class="font-medium text-right">{{ match.group || match.type.toUpperCase() }}</div>

            <div class="text-white/50">Fecha</div>
            <div class="font-medium text-right">{{ formatMatchDate(match.local_date) }}</div>

            <div class="text-white/50">Horario</div>
            <div class="font-medium text-right">{{ formatMatchTime(match.local_date) }} hs</div>

            <div v-if="stadium" class="text-white/50">Estadio</div>
            <div v-if="stadium" class="font-medium text-right">
              <div>{{ stadium.fifa_name || stadium.name_en }}</div>
              <div class="text-xs text-white/40">{{ stadium.city_en }}, {{ stadium.country_en }}</div>
              <div class="text-xs text-white/40">Capacidad: {{ stadium.capacity?.toLocaleString() }} espectadores</div>
            </div>

            <div v-if="match.matchday" class="text-white/50">Jornada</div>
            <div v-if="match.matchday" class="font-medium text-right">{{ match.matchday }}</div>
          </div>
        </div>

        <!-- Streaming Links -->
        <div v-if="isUpcoming" class="glass rounded-xl p-4 mb-4">
          <h4 class="text-sm font-bold text-white/70 mb-3">📺 Dónde verlo</h4>
          <div class="space-y-2">
            <a v-for="site in streamingSites" :key="site.name"
              :href="site.url" target="_blank" rel="noopener noreferrer"
              class="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 hover:bg-primary/10 border border-white/10 hover:border-primary/30 transition-all group">
              <span class="text-xl">{{ site.icon }}</span>
              <span class="flex-1 font-medium group-hover:text-primary transition-colors">{{ site.name }}</span>
              <span class="text-white/30 group-hover:text-primary transition-colors">→</span>
            </a>
          </div>
          <p class="text-xs text-white/30 mt-3 text-center">
            Los enlaces pueden variar según tu país. Revisá la programación local.
          </p>
        </div>

        <!-- Completed indicator -->
        <div v-if="isFinished" class="text-center">
          <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/30">
            <span class="text-green-400">✅</span>
            <span class="text-sm text-green-400 font-medium">Partido finalizado</span>
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end">
        <UButton @click="emit('update:open', false)" color="neutral" variant="outline">Cerrar</UButton>
      </div>
    </template>
  </UModal>
</template>
