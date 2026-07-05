import { useDb, users, eq } from '../../db'
import { compare } from 'bcryptjs'
import { SignJWT } from 'jose'

export default defineEventHandler(async (event) => {
  const db = useDb()
  const body = await readBody(event)
  const config = useRuntimeConfig()

  const { email, password } = body

  if (!email || !password) {
    throw createError({ statusCode: 400, message: 'Email y contraseña son requeridos' })
  }

  const user = await db.query.users.findFirst({
    where: eq(users.email, email)
  })

  if (!user) {
    throw createError({ statusCode: 401, message: 'Credenciales inválidas' })
  }

  const valid = await compare(password, user.passwordHash)
  if (!valid) {
    throw createError({ statusCode: 401, message: 'Credenciales inválidas' })
  }

  const secret = new TextEncoder().encode(config.jwtSecret)
  const token = await new SignJWT({ userId: user.id, username: user.username })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(secret)

  setCookie(event, 'auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7,
    path: '/'
  })

  return {
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      avatar: user.avatar,
      role: user.role
    }
  }
})
