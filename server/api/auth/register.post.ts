import { useDb, users, eq, or } from '../../db'
import { hash } from 'bcryptjs'

export default defineEventHandler(async (event) => {
  const db = useDb()
  const body = await readBody(event)

  const { username, email, password, fullName } = body

  if (!username || !email || !password || !fullName) {
    throw createError({ statusCode: 400, message: 'Todos los campos son requeridos' })
  }

  if (password.length < 6) {
    throw createError({ statusCode: 400, message: 'La contraseña debe tener al menos 6 caracteres' })
  }

  const existing = await db.query.users.findFirst({
    where: or(eq(users.username, username), eq(users.email, email))
  })

  if (existing) {
    throw createError({ statusCode: 409, message: 'El usuario o email ya existe' })
  }

  const passwordHash = await hash(password, 10)

  const result = await db.insert(users).values({
    username,
    email,
    passwordHash,
    fullName
  }).returning({
    id: users.id,
    username: users.username,
    email: users.email,
    fullName: users.fullName,
    avatar: users.avatar
  })

  return { user: result[0] }
})
