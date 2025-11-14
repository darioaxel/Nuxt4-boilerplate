export default defineNuxtRouteMiddleware((to) => {
  const session = useUserSession()

  // Si no está autenticado → login
  if (!session.loggedIn) {
    return navigateTo("/login")
  }

  // Lee los roles permitidos desde definePageMeta
  const allowed = to.meta.roles as string[] | undefined

  // Si la página pide roles y el usuario no tiene uno válido → forbidden
  if (allowed && !allowed.includes(session.user?.role)) {
    return navigateTo("/forbidden")
  }
})
