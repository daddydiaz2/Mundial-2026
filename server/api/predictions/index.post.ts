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
  const db = useDb()

  const { matchId, homeScore, awayScore } = body

  if (homeScore === undefined || awayScore === undefined) {
    throw createError({ statusCode: 400, message: 'Score requerido' })
  }

  const existing = await db.query.predictions.findFirst({
    where: and(
      eq(predictions.userId, payload.userId as number),
      eq(predictions.matchId, matchId)
    )
  })

  if (existing) {
    throw createError({ statusCode: 409, message: 'Ya tenés una predicción para este partido' })
  }

  const result = await db.insert(predictions).values({
    userId: payload.userId as number,
    matchId,
    homeScore,
    awayScore
  }).returning()

  return { prediction: result[0] }
})
