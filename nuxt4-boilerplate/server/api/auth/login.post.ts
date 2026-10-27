import bcrypt from "bcrypt"

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { email, password } = body

  const user = await prisma.user.findUnique({ where: { email } })

  if (!user) {
    throw createError({ statusCode: 400, message: "Usuario no encontrado" })
  }

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) {
    throw createError({ statusCode: 400, message: "Credenciales incorrectas" })
  }

  // Guardar sesión
  await setUserSession(event, {
    user: {
      id: user.id,
      email: user.email,
      role: user.role // "USER" | "ADMIN" | "ROOT"
    }
  })

  return { success: true }
})
