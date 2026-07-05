import { useDb, predictions, eq } from '../../db'
import { jwtVerify } from 'jose'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const token = getCookie(event, 'auth-token')

  if (!token) {
    throw createError({ statusCode: 401, message: 'No autenticado' })
  }

  const secret = new TextEncoder().encode(config.jwtSecret)
  const { payload } = await jwtVerify(token, secret)
  const db = useDb()

  const userPredictions = await db.query.predictions.findMany({
    where: eq(predictions.userId, payload.userId as number)
  })

  const exact = userPredictions.filter(p => p.isExact).length
  const resultOnly = userPredictions.filter(p => p.isResult && !p.isExact).length
  const wrong = userPredictions.filter(p => !p.isResult).length
  const total = userPredictions.length
  const accuracy = total > 0 ? Math.round(((exact + resultOnly) / total) * 100) : 0
  const totalPoints = userPredictions.reduce((sum, p) => sum + (p.points || 0), 0)

  // Points by phase (fetch matches from external API to categorize)
  const maxStreak = calculateMaxStreak(userPredictions)

  // Last 10 predictions for streak chart
  const last10 = [...userPredictions]
    .sort((a, b) => (b.id || 0) - (a.id || 0))
    .slice(0, 10)
    .reverse()

  return {
    exact,
    resultOnly,
    wrong,
    total,
    accuracy,
    totalPoints,
    maxStreak,
    currentStreak: calculateCurrentStreak(userPredictions),
    lastPredictions: last10.map(p => ({
      matchId: p.matchId,
      homeScore: p.homeScore,
      awayScore: p.awayScore,
      points: p.points,
      isExact: p.isExact,
      isResult: p.isResult
    })),
    // Calculate points if all predictions were correct
    maxPossiblePoints: total * 3,
    predictions: userPredictions
  }
})

function calculateMaxStreak(predictions: any[]): number {
  let maxStr = 0
  let curStr = 0
  for (const p of [...predictions].sort((a, b) => (a.id || 0) - (b.id || 0))) {
    if (p.isResult || p.isExact) {
      curStr++
      if (curStr > maxStr) maxStr = curStr
    } else {
      curStr = 0
    }
  }
  return maxStr
}

function calculateCurrentStreak(predictions: any[]): number {
  let curStr = 0
  const sorted = [...predictions].sort((a, b) => (b.id || 0) - (a.id || 0))
  for (const p of sorted) {
    if (p.isResult || p.isExact) {
      curStr++
    } else {
      break
    }
  }
  return curStr
}
