<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  open: boolean
  match: any
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  submit: [homeScore: number, awayScore: number]
}>()

const homeScore = ref(0)
const awayScore = ref(0)

watch(() => props.open, (val) => {
  if (val) {
    homeScore.value = 0
    awayScore.value = 0
  }
})

function handleSubmit() {
  emit('submit', homeScore.value, awayScore.value)
  emit('update:open', false)
}

const quickScores = [
  { home: 1, away: 0 },
  { home: 2, away: 1 },
  { home: 1, away: 1 },
  { home: 2, away: 0 },
  { home: 3, away: 1 },
  { home: 0, away: 1 }
]
</script>

<template>
  <UModal :open="open" @update:open="emit('update:open', $event)">
    <template #header>
      <h3 class="text-xl font-bold gradient-text">Hacer Predicción</h3>
    </template>

    <template v-if="match">
      <div class="text-center mb-6">
        <div class="flex items-center justify-center gap-6">
          <div class="text-center">
            <div class="font-bold">{{ match.home_team_name_en }}</div>
          </div>
          <div class="text-xl font-bold text-white/30">VS</div>
          <div class="text-center">
            <div class="font-bold">{{ match.away_team_name_en }}</div>
          </div>
        </div>
      </div>

      <div class="flex items-center justify-center gap-4 mb-6">
        <div class="text-center">
          <p class="text-xs text-white/50 mb-2">Local</p>
          <input v-model.number="homeScore" type="number" min="0" max="20"
            class="w-20 h-20 text-center text-3xl font-bold bg-white/10 rounded-xl border border-white/20 focus:border-primary focus:ring-2 focus:ring-primary/50 transition-all outline-none" />
        </div>
        <div class="text-2xl font-bold text-white/30">-</div>
        <div class="text-center">
          <p class="text-xs text-white/50 mb-2">Visitante</p>
          <input v-model.number="awayScore" type="number" min="0" max="20"
            class="w-20 h-20 text-center text-3xl font-bold bg-white/10 rounded-xl border border-white/20 focus:border-primary focus:ring-2 focus:ring-primary/50 transition-all outline-none" />
        </div>
      </div>

      <div class="flex flex-wrap gap-2 justify-center">
        <button v-for="score in quickScores" :key="`${score.home}-${score.away}`"
          @click="homeScore = score.home; awayScore = score.away"
          class="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-sm">
          {{ score.home }}-{{ score.away }}
        </button>
      </div>
    </template>

    <template #footer>
      <div class="flex gap-3 justify-end">
        <UButton @click="emit('update:open', false)" color="neutral" variant="outline">Cancelar</UButton>
        <UButton @click="handleSubmit" color="primary">Confirmar</UButton>
      </div>
    </template>
  </UModal>
</template>
