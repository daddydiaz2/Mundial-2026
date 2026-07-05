import { useDb, users, predictions, eq } from '../../db'
import { jwtVerify } from 'jose'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const token = getCookie(event, 'auth-token')
  if (!token) throw createError({ statusCode: 401, message: 'No autenticado' })

  const secret = new TextEncoder().encode(config.jwtSecret)
  const { payload } = await jwtVerify(token, secret)
  const db = useDb()

  const admin = await db.query.users.findFirst({ where: eq(users.id, payload.userId as number) })
  if (!admin || admin.role !== 'admin') {
    throw createError({ statusCode: 403, message: 'No autorizado' })
  }

  const allUsers = await db.query.users.findMany()
  const allPredictions = await db.query.predictions.findMany()

  return {
    totalUsers: allUsers.length,
    totalPredictions: allPredictions.length,
    totalPoints: allUsers.reduce((sum, u) => sum + (u.totalPoints || 0), 0),
    topUsers: allUsers.sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0)).slice(0, 10)
  }
})
