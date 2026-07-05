import { defineStore } from 'pinia'
import { ref } from 'vue'

interface Prediction {
  id: number
  userId: number
  matchId: string
  homeScore: number
  awayScore: number
  points: number
  isExact: number
  isResult: number
}

export const usePredictionsStore = defineStore('predictions', () => {
  const predictions = ref<Prediction[]>([])
  const loading = ref(false)

  function getPrediction(matchId: string) {
    return predictions.value.find(p => p.matchId === matchId)
  }

  async function fetchPredictions() {
    loading.value = true
    try {
      const data = await $fetch('/api/predictions')
      predictions.value = (data as any).predictions
    } catch (e) {
      console.error('Error fetching predictions:', e)
    } finally {
      loading.value = false
    }
  }

  async function makePrediction(matchId: string, homeScore: number, awayScore: number) {
    const data = await $fetch('/api/predictions', {
      method: 'POST',
      body: { matchId, homeScore, awayScore }
    })
    predictions.value.push((data as any).prediction)
    return data
  }

  async function updatePrediction(matchId: string, homeScore: number, awayScore: number) {
    const data = await $fetch(`/api/predictions/${matchId}`, {
      method: 'PUT',
      body: { homeScore, awayScore }
    })
    const idx = predictions.value.findIndex(p => p.matchId === matchId)
    if (idx >= 0) {
      predictions.value[idx] = (data as any).prediction
    }
    return data
  }

  return { predictions, loading, getPrediction, fetchPredictions, makePrediction, updatePrediction }
})
