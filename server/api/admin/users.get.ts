import { useDb, users, eq } from '../../db'
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
  return {
    users: allUsers.map(u => ({
      id: u.id,
      username: u.username,
      email: u.email,
      fullName: u.fullName,
      totalPoints: u.totalPoints,
      accuracy: u.accuracy,
      role: u.role,
      createdAt: u.createdAt
    }))
  }
})
