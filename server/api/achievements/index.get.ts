import { useDb, achievements, predictions, eq } from '../../db'
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

  const userAchievements = await db.query.achievements.findMany({
    where: eq(achievements.userId, payload.userId as number)
  })

  const userPredictions = await db.query.predictions.findMany({
    where: eq(predictions.userId, payload.userId as number)
  })

  const exactCount = userPredictions.filter(p => p.isExact).length
  const totalPoints = userPredictions.reduce((sum, p) => sum + (p.points || 0), 0)

  const badges = [
    { id: 'first_prediction', name: 'Primera Predicción', icon: '🎯', description: 'Hacé tu primera predicción', unlocked: userPredictions.length >= 1 },
    { id: 'streak_5', name: 'Racha de 5', icon: '🔥', description: 'Acierta 5 predicciones seguidas', unlocked: exactCount >= 5 },
    { id: 'prophet', name: 'Profeta', icon: '💎', description: '10 predicciones exactas', unlocked: exactCount >= 10 },
    { id: 'consistent', name: 'Consistente', icon: '🌟', description: '70%+ de precisión', unlocked: false },
    { id: 'millionaire', name: 'Millonario', icon: '💰', description: 'Acumulá 1000 puntos', unlocked: totalPoints >= 1000 },
  ]

  return { badges, userAchievements: userAchievements.map(a => a.badgeType) }
})
