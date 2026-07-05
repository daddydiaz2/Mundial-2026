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

  return {
    exact,
    resultOnly,
    wrong,
    total,
    accuracy,
    totalPoints,
    predictions: userPredictions
  }
})
