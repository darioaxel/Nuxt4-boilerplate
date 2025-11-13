import { prisma } from '~~/server/utils/prisma'
import bcrypt from 'bcrypt'

export default defineEventHandler(async (event) => {
  const { email, password } = await readBody(event)

  if (!email || !password) {
    throw createError({ statusCode: 400, message: 'Email y contraseña requeridos' })
  }

  const user = await prisma.user.findUnique({ where: { email } })

  if (!user) {
    throw createError({ statusCode: 401, message: 'Credenciales inválidas' })
  }

  const ok = await bcrypt.compare(password, user.password)
  if (!ok) {
    throw createError({ statusCode: 401, message: 'Credenciales inválidas' })
  }

  await setUserSession(event, {
    user: {
      id: user.id,
      email: user.email,
    },
    loggedInAt: Date.now(),
  })

  return { ok: true }
})
