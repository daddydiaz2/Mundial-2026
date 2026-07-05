<script setup lang="ts">
import { computed, watch } from 'vue'
import confetti from 'canvas-confetti'

const props = defineProps<{
  matches: any[]
}>()

const emit = defineEmits<{ predict: [match: any] }>()

const worldcup = useWorldCupStore()

const stages = computed(() => {
  const order = ['r32', 'r16', 'qf', 'sf', 'final']
  const result: { type: string; label: string; matches: any[]; color: string }[] = []
  const labels: Record<string, string> = {
    r32: 'Ronda de 32', r16: 'Octavos', qf: 'Cuartos',
    sf: 'Semifinal', final: 'Final', third: '3er Puesto'
  }
  const colors: Record<string, string> = {
    r32: '#3b82f6', r16: '#8b5cf6', qf: '#ec4899',
    sf: '#f97316', final: '#fbbf24', third: '#6b7280'
  }

  for (const type of order) {
    const matches = props.matches.filter(m => m.type === type)
    if (matches.length) {
      result.push({ type, label: labels[type], matches, color: colors[type] })
    }
  }

  const third = props.matches.find(m => m.type === 'third')
  if (third) {
    result.push({ type: 'third', label: labels.third, matches: [third], color: colors.third })
  }

  return result
})

const champion = computed(() => {
  const f = stages.value.find(s => s.type === 'final')?.matches[0]
  if (f && f.finished === 'TRUE') {
    return Number(f.home_score) > Number(f.away_score)
      ? worldcup.getTeam(f.home_team_id)
      : worldcup.getTeam(f.away_team_id)
  }
  return null
})

function getTeamName(id: string) {
  const team = worldcup.getTeam(id)
  return team ? team.name_en : (id === '0' ? 'TBD' : `Team ${id}`)
}

function getTeamFlag(id: string) {
  if (id === '0') return ''
  const team = worldcup.getTeam(id)
  return team?.flag || ''
}

function matchState(match: any) {
  if (match.finished === 'TRUE') return 'finished'
  if (match.time_elapsed === 'notstarted') return 'pending'
  return 'live'
}

function getScore(match: any, teamId: string) {
  if (match.finished !== 'TRUE' && match.time_elapsed === 'notstarted') return '-'
  const score = teamId === match.home_team_id ? match.home_score : match.away_score
  return score || '0'
}

function isWinner(match: any, teamId: string) {
  if (match.finished !== 'TRUE') return false
  if (teamId === '0') return false
  if (teamId === match.home_team_id) return Number(match.home_score) > Number(match.away_score)
  return Number(match.away_score) > Number(match.home_score)
}

function isLoser(match: any, teamId: string) {
  if (match.finished !== 'TRUE') return false
  if (teamId === '0') return false
  return !isWinner(match, teamId)
}

// Draw between SF and Final
const sfFinalLines = computed(() => {
  const sfCount = stages.value.find(s => s.type === 'sf')?.matches.length || 0
  if (!sfCount) return ''
  const lines: string[] = []
  for (let i = 0; i < sfCount; i++) {
    const y1 = i * 120 + 60
    const y2 = 120
    lines.push(`M 0 ${y1} L 20 ${y1} L 20 ${y2} L 40 ${y2}`)
  }
  return lines.join(' ')
})

watch(champion, (val) => {
  if (val) triggerConfetti()
})

function triggerConfetti() {
  const duration = 5000
  const end = Date.now() + duration
  ;(function frame() {
    confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#fbbf24', '#3b82f6', '#8b5cf6', '#10b981'] })
    confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#fbbf24', '#3b82f6', '#8b5cf6', '#10b981'] })
    if (Date.now() < end) requestAnimationFrame(frame)
  }())
}
</script>

<template>
  <div class="glass-card overflow-hidden">
    <h2 class="text-2xl font-bold text-center mb-6">
      <span class="gradient-text">Bracket Eliminatorio</span>
    </h2>

    <div class="overflow-x-auto pb-4">
      <div class="flex items-stretch gap-6 min-w-max p-4">
        <template v-for="(stage, si) in stages" :key="stage.type">
          <!-- Stage Column -->
          <div class="flex flex-col justify-around" style="min-width:160px">
            <h3 class="text-xs font-bold text-center mb-3 uppercase tracking-widest"
              :style="{ color: stage.color }">
              {{ stage.label }}
            </h3>

            <div v-for="match in stage.matches" :key="match.id"
              class="relative mb-3 last:mb-0 cursor-pointer group"
              @click="emit('predict', match)">

              <div class="relative rounded-xl overflow-hidden transition-all duration-200 group-hover:scale-[1.02]"
                :style="{
                  border: `1px solid ${match.finished === 'TRUE' ? '#10b981' : match.time_elapsed !== 'notstarted' ? '#ef444480' : stage.color}40`,
                  background: match.finished === 'TRUE' ? 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(16,185,129,0.02))' : 'rgba(255,255,255,0.03)'
                }">

                <!-- Match teams -->
                <div class="p-2.5 space-y-1.5">
                  <!-- Home team -->
                  <div class="flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors"
                    :class="{
                      'bg-green-500/20': isWinner(match, match.home_team_id),
                      'bg-red-500/10 line-through decoration-red-500/70 opacity-60': isLoser(match, match.home_team_id)
                    }">
                    <img v-if="getTeamFlag(match.home_team_id)" :src="getTeamFlag(match.home_team_id)"
                      class="w-6 h-6 rounded-full flex-shrink-0 border border-white/10" />
                    <span v-else class="w-6 h-6 rounded-full flex-shrink-0 bg-white/10 flex items-center justify-center text-[10px]">?</span>
                    <span class="text-xs font-medium truncate flex-1">{{ getTeamName(match.home_team_id) }}</span>
                    <span class="text-sm font-black"
                      :class="matchState(match) === 'finished' ? 'text-white' : 'text-white/50'">
                      {{ getScore(match, match.home_team_id) }}
                    </span>
                  </div>

                  <!-- Away team -->
                  <div class="flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors"
                    :class="{
                      'bg-green-500/20': isWinner(match, match.away_team_id),
                      'bg-red-500/10 line-through decoration-red-500/70 opacity-60': isLoser(match, match.away_team_id)
                    }">
                    <img v-if="getTeamFlag(match.away_team_id)" :src="getTeamFlag(match.away_team_id)"
                      class="w-6 h-6 rounded-full flex-shrink-0 border border-white/10" />
                    <span v-else class="w-6 h-6 rounded-full flex-shrink-0 bg-white/10 flex items-center justify-center text-[10px]">?</span>
                    <span class="text-xs font-medium truncate flex-1">{{ getTeamName(match.away_team_id) }}</span>
                    <span class="text-sm font-black"
                      :class="matchState(match) === 'finished' ? 'text-white' : 'text-white/50'">
                      {{ getScore(match, match.away_team_id) }}
                    </span>
                  </div>
                </div>

                <!-- Live indicator -->
                <div v-if="matchState(match) === 'live'"
                  class="absolute -top-1 -right-1 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[9px] font-bold">
                  <span class="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                  EN VIVO
                </div>
              </div>
            </div>
          </div>

          <!-- SVG Connector -->
          <div v-if="si < stages.length - 1" class="flex items-center flex-shrink-0" style="width:32px">
            <svg width="32" :height="Math.max(stage.matches.length * 80, 40)"
              :viewBox="`0 0 32 ${Math.max(stage.matches.length * 80, 40)}`">
              <path
                v-for="(_, i) in stage.matches.slice(0, Math.floor(stages[si + 1]?.matches?.length || 1) * 2 || 1)"
                :key="i"
                :d="`M 0 ${i * 80 + 40} L 32 ${i * 80 + 40}`"
                :stroke="stage.color + '40'" stroke-width="2" fill="none"
                stroke-dasharray="4,4" />
            </svg>
          </div>
        </template>

        <!-- Champion -->
        <div v-if="champion" class="flex flex-col justify-center items-center min-w-[140px]">
          <div class="text-center animate-float">
            <div class="text-6xl mb-3">🏆</div>
            <img v-if="getTeamFlag(champion.id)" :src="getTeamFlag(champion.id)"
              class="w-16 h-16 rounded-full mx-auto mb-3 border-2 border-primary shadow-lg shadow-primary/30" />
            <div class="text-lg font-bold gradient-text">{{ champion.name_en }}</div>
            <div class="text-xs text-white/50 uppercase tracking-widest mt-1">Campeón 2026</div>
          </div>
        </div>
        <div v-else class="flex flex-col justify-center items-center min-w-[140px]">
          <div class="text-center">
            <div class="text-5xl mb-3 opacity-30">🏆</div>
            <div class="text-sm text-white/30">Por definir</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.line-through {
  text-decoration: line-through;
}
</style>
