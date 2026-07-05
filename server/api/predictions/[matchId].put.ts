import { useDb, predictions, eq, and } from '../../db'
import { jwtVerify } from 'jose'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const token = getCookie(event, 'auth-token')

  if (!token) {
    throw createError({ statusCode: 401, message: 'No autenticado' })
  }

  const secret = new TextEncoder().encode(config.jwtSecret)
  const { payload } = await jwtVerify(token, secret)
  const body = await readBody(event)
  const matchId = getRouterParam(event, 'matchId')
  const db = useDb()

  const { homeScore, awayScore } = body

  const result = await db.update(predictions)
    .set({ homeScore, awayScore })
    .where(and(
      eq(predictions.userId, payload.userId as number),
      eq(predictions.matchId, matchId!)
    ))
    .returning()

  return { prediction: result[0] }
})
