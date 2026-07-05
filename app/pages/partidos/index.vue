<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

useHead({ title: 'Partidos' })

const worldcup = useWorldCupStore()
const { isAuthenticated } = useAuth()

const activeTab = ref('all')
const searchQuery = ref('')
const selectedMatch = ref<any>(null)
const detailSection = ref<HTMLElement | null>(null)
const showScrollTop = ref(false)

function openDetail(match: any) {
  selectedMatch.value = match
  nextTick(() => {
    detailSection.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(async () => {
  await worldcup.fetchAll()
  window.addEventListener('scroll', () => {
    showScrollTop.value = window.scrollY > 400
  })
})

onUnmounted(() => {
  window.removeEventListener('scroll', () => {})
})

const tabs = [
  { id: 'all', label: 'Todos', icon: '⚽' },
  { id: 'group', label: 'Grupos', icon: '📊' },
  { id: 'knockout', label: 'Eliminatorias', icon: '🏆' },
  { id: 'results', label: 'Resultados', icon: '✅' },
  { id: 'upcoming', label: 'Próximos', icon: '📅' }
]

const filteredMatches = computed(() => {
  let matches = worldcup.matches

  if (activeTab.value === 'group') {
    matches = matches.filter(m => m.type === 'group')
  } else if (activeTab.value === 'knockout') {
    matches = matches.filter(m => ['r32', 'r16', 'qf', 'sf', 'final', 'third'].includes(m.type))
  } else if (activeTab.value === 'results') {
    matches = matches.filter(m => m.finished === 'TRUE')
  } else if (activeTab.value === 'upcoming') {
    matches = matches.filter(m => m.finished === 'FALSE' && m.time_elapsed === 'notstarted')
  }

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    matches = matches.filter(m => {
      const home = (m.home_team_name_en || '').toLowerCase()
      const away = (m.away_team_name_en || '').toLowerCase()
      return home.includes(q) || away.includes(q)
    })
  }

  return matches
})

const matchStats = computed(() => ({
  total: worldcup.matches.length,
  finished: worldcup.matches.filter(m => m.finished === 'TRUE').length,
  upcoming: worldcup.matches.filter(m => m.finished === 'FALSE' && m.time_elapsed === 'notstarted').length
}))

function getTeam(teamId: string) {
  return worldcup.getTeam(teamId)
}

function getStadiumName(stadiumId: string) {
  if (!stadiumId) return 'Por definir'
  const stadium = worldcup.stadiums.find((s: any) => s.id === stadiumId)
  return stadium ? `${stadium.name_en}, ${stadium.city_en}` : 'Por definir'
}

function getStadiumCapacity(stadiumId: string) {
  if (!stadiumId) return ''
  const stadium = worldcup.stadiums.find((s: any) => s.id === stadiumId)
  return stadium?.capacity ? `${stadium.capacity.toLocaleString()} espectadores` : ''
}

function parseScorers(scorersStr: string) {
  if (!scorersStr || scorersStr === 'null') return []
  try {
    const cleaned = scorersStr.replace(/["""]/g, '"')
    return JSON.parse(cleaned)
  } catch {
    return []
  }
}

function formatDate(dateStr: string) {
  try {
    const [datePart, timePart] = dateStr.split(' ')
    const [m, d, y] = datePart.split('/')
    return format(new Date(`${y}-${m}-${d}T${timePart}`), 'dd MMM', { locale: es })
  } catch { return '' }
}

function formatHour(dateStr: string) {
  try {
    const [, timePart] = dateStr.split(' ')
    return timePart
  } catch { return '' }
}

const phaseColors: Record<string, string> = {
  group: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  r32: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  r16: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
  qf: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  sf: 'bg-red-500/20 text-red-300 border-red-500/30',
  final: 'bg-gradient-to-r from-yellow-500/30 to-amber-500/30 text-yellow-300 border-yellow-500/30',
  third: 'bg-gray-500/20 text-gray-300 border-gray-500/30'
}

const phaseLabels: Record<string, string> = {
  group: 'Grupo', r32: 'R32', r16: 'O8',
  qf: 'C4', sf: 'Semi', final: 'FINAL', third: '3er'
}

// Group matches by matchday (uses filteredMatches so search works)
const groupedMatches = computed(() => {
  const groups: { label: string; matches: any[] }[] = []
  const source = activeTab.value === 'all' ? filteredMatches.value : filteredMatches.value

  // Group stage by matchday
  const groupMatches = source.filter(m => m.type === 'group')
  const matchdays = [...new Set(groupMatches.map(m => m.matchday))].sort()
  for (const md of matchdays) {
    const matches = groupMatches.filter(m => m.matchday === md)
    if (matches.length) {
      groups.push({ label: `Fecha ${md} - Fase de Grupos`, matches })
    }
  }

  // Knockout by phase
  const knockoutTypes = ['r32', 'r16', 'qf', 'sf', 'final', 'third']
  for (const type of knockoutTypes) {
    const matches = source.filter(m => m.type === type)
    if (matches.length) {
      groups.push({ label: phaseLabels[type] || type, matches })
    }
  }

  return groups
})
</script>

<template>
  <div class="min-h-screen">
    <!-- Header -->
    <div class="relative overflow-hidden bg-gradient-to-br from-primary/10 via-transparent to-secondary/10">
      <div class="max-w-7xl mx-auto px-4 py-12 md:py-16">
        <div class="text-center mb-8">
          <h1 class="text-4xl md:text-6xl font-bold mb-3">
            <span class="gradient-text">Partidos Mundial 2026</span>
          </h1>
          <p class="text-lg text-white/60">Todos los partidos del Mundial, resultados y próximos encuentros</p>
        </div>

        <!-- Stats -->
          <div class="grid grid-cols-3 gap-4 max-w-lg mx-auto">
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
          </div>
      </div>
    </div>

    <!-- Content -->
      <div class="max-w-5xl mx-auto px-4 py-8">
      <!-- Filters -->
      <div class="flex flex-col md:flex-row gap-4 mb-8">
        <div class="flex gap-2 overflow-x-auto pb-2">
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
        <p class="text-white/60 text-lg">Cargando partidos...</p>
      </div>

      <!-- Matches -->
      <div v-else-if="filteredMatches.length">
        <!-- Grouped view for "Todos" tab -->
        <template v-if="activeTab === 'all'">
          <div v-for="group in groupedMatches" :key="group.label" class="mb-8">
            <h2 class="text-lg font-bold mb-4 text-white/80">{{ group.label }}</h2>
            <div class="space-y-3">
              <div v-for="match in group.matches" :key="match.id"
                class="glass-card py-3 px-4 flex items-center gap-4 transition-all hover:bg-white/5 cursor-pointer"
                @click="openDetail(match)">

                <!-- Phase badge -->
                <span :class="['px-2 py-1 rounded text-[10px] font-bold uppercase border shrink-0', phaseColors[match.type] || '']">
                  {{ phaseLabels[match.type] || match.type }}
                </span>

                <!-- Date/Time -->
                <div class="w-20 text-center shrink-0">
                  <div class="text-xs text-white/60">{{ formatDate(match.local_date) }}</div>
                  <div class="text-xs font-semibold text-white/80">{{ formatHour(match.local_date) }}</div>
                </div>

                <!-- Home team -->
                <div class="flex-1 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <span class="text-sm font-medium">{{ match.home_team_name_en }}</span>
                    <img v-if="getTeam(match.home_team_id)" :src="getTeam(match.home_team_id)?.flag" class="w-6 h-6 rounded-full" />
                  </div>
                </div>

                <!-- Score -->
                <div class="w-20 text-center shrink-0">
                  <template v-if="match.finished === 'TRUE'">
                    <div class="text-xl font-black text-white">{{ match.home_score }} - {{ match.away_score }}</div>
                  </template>
                  <template v-else-if="match.time_elapsed !== 'notstarted'">
                    <div class="text-lg font-black text-red-400 animate-pulse">{{ match.home_score }} - {{ match.away_score }}</div>
                  </template>
                  <template v-else>
                    <div class="text-lg font-black text-white/30">VS</div>
                  </template>
                </div>

                <!-- Away team -->
                <div class="flex-1 text-left">
                  <div class="flex items-center gap-2">
                    <img v-if="getTeam(match.away_team_id)" :src="getTeam(match.away_team_id)?.flag" class="w-6 h-6 rounded-full" />
                    <span class="text-sm font-medium">{{ match.away_team_name_en }}</span>
                  </div>
                </div>

                <!-- Group info -->
                <span v-if="match.type === 'group'" class="text-xs text-white/30 w-8 text-center shrink-0">
                  {{ match.group }}
                </span>

                <!-- Live badge -->
                <div v-if="match.time_elapsed !== 'notstarted' && match.finished !== 'TRUE'"
                  class="px-2 py-1 rounded bg-red-500/20 text-red-400 text-[10px] font-bold flex items-center gap-1 shrink-0">
                  <span class="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
                  {{ match.time_elapsed }}'
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- Grid view for filtered tabs -->
        <template v-else>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div v-for="match in filteredMatches" :key="match.id"
              class="glass-card py-3 px-4 flex items-center gap-4 transition-all hover:bg-white/5 cursor-pointer"
              @click="openDetail(match)">

              <span :class="['px-2 py-1 rounded text-[10px] font-bold uppercase border shrink-0', phaseColors[match.type] || '']">
                {{ phaseLabels[match.type] || match.type }}
              </span>

              <div class="w-20 text-center shrink-0">
                <div class="text-xs text-white/60">{{ formatDate(match.local_date) }}</div>
                <div class="text-xs font-semibold text-white/80">{{ formatHour(match.local_date) }}</div>
              </div>

              <div class="flex-1 text-right">
                <div class="flex items-center justify-end gap-2">
                  <span class="text-sm font-medium">{{ match.home_team_name_en }}</span>
                  <img v-if="getTeam(match.home_team_id)" :src="getTeam(match.home_team_id)?.flag" class="w-6 h-6 rounded-full" />
                </div>
              </div>

              <div class="w-20 text-center shrink-0">
                <template v-if="match.finished === 'TRUE'">
                  <div class="text-xl font-black text-white">{{ match.home_score }} - {{ match.away_score }}</div>
                </template>
                <template v-else-if="match.time_elapsed !== 'notstarted'">
                  <div class="text-lg font-black text-red-400 animate-pulse">{{ match.home_score }} - {{ match.away_score }}</div>
                </template>
                <template v-else>
                  <div class="text-lg font-black text-white/30">VS</div>
                </template>
              </div>

              <div class="flex-1 text-left">
                <div class="flex items-center gap-2">
                  <img v-if="getTeam(match.away_team_id)" :src="getTeam(match.away_team_id)?.flag" class="w-6 h-6 rounded-full" />
                  <span class="text-sm font-medium">{{ match.away_team_name_en }}</span>
                </div>
              </div>

              <div v-if="match.time_elapsed !== 'notstarted' && match.finished !== 'TRUE'"
                class="px-2 py-1 rounded bg-red-500/20 text-red-400 text-[10px] font-bold flex items-center gap-1 shrink-0">
                <span class="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
                {{ match.time_elapsed }}'
              </div>
            </div>
          </div>
        </template>
      </div>

      <!-- Empty -->
      <div v-else class="text-center py-20 glass-card">
        <div class="text-5xl mb-4">⚽</div>
        <h3 class="text-xl font-bold mb-2">No se encontraron partidos</h3>
        <p class="text-white/60">Intentá con otra búsqueda o filtro</p>
      </div>

      <!-- Bracket -->
      <section v-if="worldcup.matches.length" class="mt-12">
        <LiveBracket :matches="worldcup.matches" />
      </section>

      <!-- Match Detail Section -->
      <section ref="detailSection" v-if="selectedMatch" class="mt-12 scroll-mt-20">
        <div class="glass-card relative overflow-hidden">
          <div class="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl"></div>

          <!-- Close button -->
          <button @click="selectedMatch = null" class="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all">
            <span class="text-white/60 hover:text-white">✕</span>
          </button>

          <div class="relative">
            <!-- Header -->
            <div class="text-center mb-6">
              <div class="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border"
                :class="phaseColors[selectedMatch.type] || ''">
                {{ phaseLabels[selectedMatch.type] || selectedMatch.type }}
              </div>
              <p class="text-sm text-white/50 mt-2">{{ formatDate(selectedMatch.local_date) }} · {{ formatHour(selectedMatch.local_date) }}</p>
            </div>

            <!-- Teams -->
            <div class="flex items-center justify-center gap-4 md:gap-10 mb-8">
              <div class="flex-1 text-center">
                <img v-if="getTeam(selectedMatch.home_team_id)" :src="getTeam(selectedMatch.home_team_id)?.flag"
                  class="w-20 h-20 md:w-24 md:h-24 rounded-full mx-auto mb-3 border-2 shadow-lg"
                  :class="selectedMatch.finished === 'TRUE' && Number(selectedMatch.home_score) > Number(selectedMatch.away_score) ? 'border-primary shadow-primary/30' : 'border-white/20'" />
                <h3 class="font-bold text-lg">{{ selectedMatch.home_team_name_en }}</h3>
                <p class="text-xs text-white/40">{{ getTeam(selectedMatch.home_team_id)?.fifa_code }}</p>
              </div>

              <div class="text-center shrink-0">
                <template v-if="selectedMatch.finished === 'TRUE'">
                  <div class="text-5xl md:text-6xl font-black gradient-text">{{ selectedMatch.home_score }} - {{ selectedMatch.away_score }}</div>
                  <p class="text-xs text-white/40 mt-1">Finalizado</p>
                </template>
                <template v-else-if="selectedMatch.time_elapsed !== 'notstarted'">
                  <div class="text-4xl md:text-5xl font-black text-red-400 animate-pulse">{{ selectedMatch.home_score }} - {{ selectedMatch.away_score }}</div>
                  <div class="flex items-center justify-center gap-1 mt-1">
                    <span class="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                    <span class="text-xs text-red-400 font-bold">{{ selectedMatch.time_elapsed }}'</span>
                  </div>
                </template>
                <template v-else>
                  <div class="text-3xl md:text-4xl font-bold text-white/30">VS</div>
                  <p class="text-xs text-white/30 mt-1">Próximo partido</p>
                </template>
              </div>

              <div class="flex-1 text-center">
                <img v-if="getTeam(selectedMatch.away_team_id)" :src="getTeam(selectedMatch.away_team_id)?.flag"
                  class="w-20 h-20 md:w-24 md:h-24 rounded-full mx-auto mb-3 border-2 shadow-lg"
                  :class="selectedMatch.finished === 'TRUE' && Number(selectedMatch.away_score) > Number(selectedMatch.home_score) ? 'border-primary shadow-primary/30' : 'border-white/20'" />
                <h3 class="font-bold text-lg">{{ selectedMatch.away_team_name_en }}</h3>
                <p class="text-xs text-white/40">{{ getTeam(selectedMatch.away_team_id)?.fifa_code }}</p>
              </div>
            </div>

            <!-- Stats Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Goal Scorers -->
              <div v-if="selectedMatch.finished === 'TRUE' && (selectedMatch.home_scorers !== 'null' || selectedMatch.away_scorers !== 'null')" class="glass rounded-xl p-4">
                <h4 class="text-sm font-bold text-white/70 mb-3 flex items-center gap-2">
                  <span>⚽</span> Goles
                </h4>
                <div class="space-y-2">
                  <div v-for="scorer in parseScorers(selectedMatch.home_scorers)" :key="scorer"
                    class="flex items-center gap-2 text-sm bg-green-500/10 rounded-lg px-3 py-2">
                    <span class="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0"></span>
                    <span class="font-medium">{{ selectedMatch.home_team_name_en }}</span>
                    <span class="text-white/60 ml-auto font-mono">{{ scorer }}</span>
                  </div>
                  <div v-for="scorer in parseScorers(selectedMatch.away_scorers)" :key="scorer"
                    class="flex items-center gap-2 text-sm bg-blue-500/10 rounded-lg px-3 py-2">
                    <span class="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0"></span>
                    <span class="font-medium">{{ selectedMatch.away_team_name_en }}</span>
                    <span class="text-white/60 ml-auto font-mono">{{ scorer }}</span>
                  </div>
                  <p v-if="!parseScorers(selectedMatch.home_scorers).length && !parseScorers(selectedMatch.away_scorers).length" class="text-sm text-white/40 text-center py-2">
                    Sin goles registrados
                  </p>
                </div>
              </div>

              <!-- Match Info -->
              <div class="glass rounded-xl p-4">
                <h4 class="text-sm font-bold text-white/70 mb-3 flex items-center gap-2">
                  <span>📋</span> Información
                </h4>
                <div class="space-y-2">
                  <div class="flex justify-between py-1.5 text-sm border-b border-white/5">
                    <span class="text-white/50">Fase</span>
                    <span class="font-medium">{{ phaseLabels[selectedMatch.type] || selectedMatch.type }}</span>
                  </div>
                  <div v-if="selectedMatch.type === 'group'" class="flex justify-between py-1.5 text-sm border-b border-white/5">
                    <span class="text-white/50">Grupo</span>
                    <span class="font-medium">{{ selectedMatch.group }}</span>
                  </div>
                  <div class="flex justify-between py-1.5 text-sm border-b border-white/5">
                    <span class="text-white/50">Fecha</span>
                    <span class="font-medium">{{ formatDate(selectedMatch.local_date) }} {{ formatHour(selectedMatch.local_date) }}</span>
                  </div>
                  <div v-if="selectedMatch.matchday" class="flex justify-between py-1.5 text-sm border-b border-white/5">
                    <span class="text-white/50">Jornada</span>
                    <span class="font-medium">{{ selectedMatch.matchday }}</span>
                  </div>
                  <div class="flex justify-between py-1.5 text-sm border-b border-white/5">
                    <span class="text-white/50">Estadio</span>
                    <span class="font-medium text-right max-w-[60%]">{{ getStadiumName(selectedMatch.stadium_id) }}</span>
                  </div>
                  <div v-if="getStadiumCapacity(selectedMatch.stadium_id)" class="flex justify-between py-1.5 text-sm">
                    <span class="text-white/50">Capacidad</span>
                    <span class="font-medium">{{ getStadiumCapacity(selectedMatch.stadium_id) }}</span>
                  </div>
                </div>
              </div>

              <!-- Streaming -->
              <div v-if="selectedMatch.time_elapsed === 'notstarted' && selectedMatch.finished !== 'TRUE'" class="glass rounded-xl p-4 md:col-span-2">
                <h4 class="text-sm font-bold text-white/70 mb-3 flex items-center gap-2">
                  <span>📺</span> Dónde verlo
                </h4>
                <a href="https://www.fifa.com/fifaplus/en/tournaments/mens/worldcup/canadamexicousa2026"
                  target="_blank" rel="noopener noreferrer"
                  class="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 hover:bg-primary/10 border border-white/10 hover:border-primary/30 transition-all group">
                  <span class="text-xl">🌍</span>
                  <span class="flex-1 font-medium group-hover:text-primary">Ver en FIFA+</span>
                  <span class="text-white/30 group-hover:text-primary">→</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- Scroll to Top Button -->
    <button v-if="showScrollTop" @click="scrollToTop"
      class="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-gradient-to-r from-primary to-primary-dark text-dark shadow-lg shadow-primary/30 flex items-center justify-center text-xl font-bold transition-all hover:scale-110 active:scale-95">
      ↑
    </button>
  </div>
</template>
