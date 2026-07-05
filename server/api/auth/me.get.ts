import { useDb, users, eq } from '../../db'
import { jwtVerify } from 'jose'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const token = getCookie(event, 'auth-token')

  if (!token) {
    throw createError({ statusCode: 401, message: 'No autenticado' })
  }

  try {
    const secret = new TextEncoder().encode(config.jwtSecret)
    const { payload } = await jwtVerify(token, secret)
    const db = useDb()

    const user = await db.query.users.findFirst({
      where: eq(users.id, payload.userId as number)
    })

    if (!user) {
      throw createError({ statusCode: 401, message: 'Usuario no encontrado' })
    }

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        avatar: user.avatar,
        totalPoints: user.totalPoints,
        accuracy: user.accuracy,
        rank: user.rank,
        role: user.role
      }
    }
  } catch {
    throw createError({ statusCode: 401, message: 'Token inválido' })
  }
})
