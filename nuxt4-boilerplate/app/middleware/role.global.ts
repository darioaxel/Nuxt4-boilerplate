export default defineNuxtRouteMiddleware(async (to) => {
  // Solo actuamos en páginas que declaran roles permitidos vía definePageMeta
  const allowed = to.meta.roles as string[] | undefined

  if (!allowed?.length) return

  const { user, loggedIn, fetch } = useUserSession()

  if (!loggedIn.value) {
    await fetch()
  }

  if (!loggedIn.value) {
    return navigateTo('/login')
  }

  if (!allowed.includes(user.value?.role ?? '')) {
    return navigateTo('/forbidden')
  }
})
