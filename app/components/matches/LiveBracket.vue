<script setup lang="ts">
import { computed, watch } from 'vue'
import confetti from 'canvas-confetti'

const props = defineProps<{
  matches: any[]
}>()

const emit = defineEmits<{ predict: [match: any] }>()

const worldcup = useWorldCupStore()

const r32 = computed(() => props.matches.filter(m => m.type === 'r32'))
const r16 = computed(() => props.matches.filter(m => m.type === 'r16'))
const qf = computed(() => props.matches.filter(m => m.type === 'qf'))
const sf = computed(() => props.matches.filter(m => m.type === 'sf'))
const finalMatch = computed(() => props.matches.find(m => m.type === 'final'))
const thirdMatch = computed(() => props.matches.find(m => m.type === 'third'))

const champion = computed(() => {
  const f = finalMatch.value
  if (f && f.finished === 'TRUE') {
    return Number(f.home_score) > Number(f.away_score)
      ? worldcup.getTeam(f.home_team_id)
      : worldcup.getTeam(f.away_team_id)
  }
  return null
})

function isWinner(match: any, teamId: string) {
  if (match.finished !== 'TRUE') return false
  if (teamId === match.home_team_id) return Number(match.home_score) > Number(match.away_score)
  return Number(match.away_score) > Number(match.home_score)
}

function isLoser(match: any, teamId: string) {
  if (match.finished !== 'TRUE') return false
  return !isWinner(match, teamId)
}

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

function getTeamData(teamId: string) {
  return worldcup.getTeam(teamId)
}
</script>

<template>
  <div class="glass-card overflow-hidden">
    <h2 class="text-2xl font-bold text-center mb-6 gradient-text">Bracket Eliminatorio</h2>

    <div class="overflow-x-auto">
      <div class="flex gap-8 min-w-max p-4">
        <!-- R32 -->
        <div v-if="r32.length" class="flex flex-col gap-3">
          <h3 class="text-sm font-bold text-white/50 text-center mb-2">Ronda de 32</h3>
          <div v-for="match in r32" :key="match.id" class="w-48">
            <div class="glass rounded-lg p-2">
              <div v-for="teamId in [match.home_team_id, match.away_team_id]" :key="teamId"
                class="flex items-center gap-2 py-1 px-2 rounded"
                :class="{
                  'bg-green-500/20': isWinner(match, teamId),
                  'line-through opacity-50': isLoser(match, teamId)
                }">
                <img v-if="getTeamData(teamId)" :src="getTeamData(teamId)?.flag" class="w-5 h-5 rounded-full" />
                <span class="text-xs font-medium flex-1 truncate">{{ getTeamData(teamId)?.name_en || 'TBD' }}</span>
                <span v-if="match.finished === 'TRUE'" class="text-xs font-bold">
                  {{ teamId === match.home_team_id ? match.home_score : match.away_score }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Connector lines R32→R16 -->
        <div v-if="r32.length && r16.length" class="flex items-center">
          <svg class="w-8 h-full" viewBox="0 0 32 400">
            <line v-for="i in Math.min(r32.length, 8)" :key="i"
              x1="0" :y1="i * 50 - 25" x2="32" :y2="Math.ceil(i / 2) * 100 - 50"
              stroke="rgba(251,191,36,0.3)" stroke-width="2" />
          </svg>
        </div>

        <!-- R16 -->
        <div v-if="r16.length" class="flex flex-col gap-6">
          <h3 class="text-sm font-bold text-white/50 text-center mb-2">Octavos</h3>
          <div v-for="match in r16" :key="match.id" class="w-48">
            <div class="glass rounded-lg p-2">
              <div v-for="teamId in [match.home_team_id, match.away_team_id]" :key="teamId"
                class="flex items-center gap-2 py-1 px-2 rounded"
                :class="{
                  'bg-green-500/20': isWinner(match, teamId),
                  'line-through opacity-50': isLoser(match, teamId)
                }">
                <img v-if="getTeamData(teamId)" :src="getTeamData(teamId)?.flag" class="w-5 h-5 rounded-full" />
                <span class="text-xs font-medium flex-1 truncate">{{ getTeamData(teamId)?.name_en || 'TBD' }}</span>
                <span v-if="match.finished === 'TRUE'" class="text-xs font-bold">
                  {{ teamId === match.home_team_id ? match.home_score : match.away_score }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Connector lines R16→QF -->
        <div v-if="r16.length && qf.length" class="flex items-center">
          <svg class="w-8 h-full" viewBox="0 0 32 400">
            <line v-for="i in Math.min(r16.length, 8)" :key="i"
              x1="0" :y1="i * 50 - 25" x2="32" :y2="Math.ceil(i / 2) * 100 - 50"
              stroke="rgba(251,191,36,0.3)" stroke-width="2" />
          </svg>
        </div>

        <!-- QF -->
        <div v-if="qf.length" class="flex flex-col gap-10">
          <h3 class="text-sm font-bold text-white/50 text-center mb-2">Cuartos</h3>
          <div v-for="match in qf" :key="match.id" class="w-48">
            <div class="glass rounded-lg p-2">
              <div v-for="teamId in [match.home_team_id, match.away_team_id]" :key="teamId"
                class="flex items-center gap-2 py-1 px-2 rounded"
                :class="{
                  'bg-green-500/20': isWinner(match, teamId),
                  'line-through opacity-50': isLoser(match, teamId)
                }">
                <img v-if="getTeamData(teamId)" :src="getTeamData(teamId)?.flag" class="w-5 h-5 rounded-full" />
                <span class="text-xs font-medium flex-1 truncate">{{ getTeamData(teamId)?.name_en || 'TBD' }}</span>
                <span v-if="match.finished === 'TRUE'" class="text-xs font-bold">
                  {{ teamId === match.home_team_id ? match.home_score : match.away_score }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Connector lines QF→SF -->
        <div v-if="qf.length && sf.length" class="flex items-center">
          <svg class="w-8 h-full" viewBox="0 0 32 400">
            <line v-for="i in Math.min(qf.length, 8)" :key="i"
              x1="0" :y1="i * 50 - 25" x2="32" :y2="Math.ceil(i / 2) * 100 - 50"
              stroke="rgba(251,191,36,0.3)" stroke-width="2" />
          </svg>
        </div>

        <!-- SF -->
        <div v-if="sf.length" class="flex flex-col gap-20">
          <h3 class="text-sm font-bold text-white/50 text-center mb-2">Semifinal</h3>
          <div v-for="match in sf" :key="match.id" class="w-48">
            <div class="glass rounded-lg p-2">
              <div v-for="teamId in [match.home_team_id, match.away_team_id]" :key="teamId"
                class="flex items-center gap-2 py-1 px-2 rounded"
                :class="{
                  'bg-green-500/20': isWinner(match, teamId),
                  'line-through opacity-50': isLoser(match, teamId)
                }">
                <img v-if="getTeamData(teamId)" :src="getTeamData(teamId)?.flag" class="w-5 h-5 rounded-full" />
                <span class="text-xs font-medium flex-1 truncate">{{ getTeamData(teamId)?.name_en || 'TBD' }}</span>
                <span v-if="match.finished === 'TRUE'" class="text-xs font-bold">
                  {{ teamId === match.home_team_id ? match.home_score : match.away_score }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Connector lines SF→Final -->
        <div v-if="sf.length && finalMatch" class="flex items-center">
          <svg class="w-8 h-full" viewBox="0 0 32 400">
            <line v-for="i in Math.min(sf.length, 8)" :key="i"
              x1="0" :y1="i * 50 - 25" x2="32" :y2="Math.ceil(i / 2) * 100 - 50"
              stroke="rgba(251,191,36,0.3)" stroke-width="2" />
          </svg>
        </div>

        <!-- Final -->
        <div v-if="finalMatch" class="flex flex-col items-center">
          <h3 class="text-sm font-bold text-white/50 text-center mb-2">Final</h3>
          <div class="w-48">
            <div class="glass rounded-lg p-2 border-2 border-primary/50">
              <div v-for="teamId in [finalMatch.home_team_id, finalMatch.away_team_id]" :key="teamId"
                class="flex items-center gap-2 py-1 px-2 rounded"
                :class="{
                  'bg-green-500/20': isWinner(finalMatch, teamId),
                  'line-through opacity-50': isLoser(finalMatch, teamId)
                }">
                <img v-if="getTeamData(teamId)" :src="getTeamData(teamId)?.flag" class="w-5 h-5 rounded-full" />
                <span class="text-xs font-medium flex-1 truncate">{{ getTeamData(teamId)?.name_en || 'TBD' }}</span>
                <span v-if="finalMatch.finished === 'TRUE'" class="text-xs font-bold">
                  {{ teamId === finalMatch.home_team_id ? finalMatch.home_score : finalMatch.away_score }}
                </span>
              </div>
            </div>
          </div>

          <!-- Champion -->
          <div v-if="champion" class="mt-6 text-center animate-float">
            <div class="text-5xl mb-2">🏆</div>
            <div class="text-xl font-bold gradient-text">{{ champion.name_en }}</div>
            <div class="text-sm text-white/50">CAMPEÓN</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.line-through {
  text-decoration: line-through;
  text-decoration-color: #ef4444;
}
</style>
