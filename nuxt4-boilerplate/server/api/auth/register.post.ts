import { Role } from "~~/app/generated/prisma/client"
import bcrypt from "bcrypt"

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { email, password, role } = body

  // Validaciones básicas
  if (!email || !password) {
    throw createError({ statusCode: 400, message: "Email y password requeridos" })
  }

  const exists = await prisma.user.findUnique({ where: { email } })

  if (exists) {
    throw createError({ statusCode: 400, message: "El usuario ya existe" })
  }

  // Hash password
  const hashed = await bcrypt.hash(password, 10)

  // Crear usuario con rol (o USER si no lo especifican)
  const user = await prisma.user.create({
    data: {
      email,
      password: hashed,
      role: role ? role.toUpperCase() as Role : Role.USER
    }
  })

  // Guardamos sesión en auth-utils
  await setUserSession(event, {
    user: {
      id: user.id,
      email: user.email,
      role: user.role
    }
  })

  return { ok: true }
})
