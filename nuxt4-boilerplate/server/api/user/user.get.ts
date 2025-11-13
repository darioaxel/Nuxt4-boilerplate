export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)

  // si no hay usuario en sesión, devolvemos null
  if (!session.user) return null

  return {
    id: session.user.id,
    email: session.user.email,
    loggedInAt: session.loggedInAt,
  }
})