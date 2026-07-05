import { useDb, users, eq } from '../../db'
import { jwtVerify } from 'jose'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const token = getCookie(event, 'auth-token')
  if (!token) throw createError({ statusCode: 401, message: 'No autenticado' })

  const secret = new TextEncoder().encode(config.jwtSecret)
  const { payload } = await jwtVerify(token, secret)
  const body = await readBody(event)
  const db = useDb()

  await db.update(users)
    .set({ pushSubscription: JSON.stringify(body.subscription) })
    .where(eq(users.id, payload.userId as number))

  return { success: true }
})
