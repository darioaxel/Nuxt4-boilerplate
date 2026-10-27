export function useRole() {
  const { user } = useUserSession()
  return computed(() => user.value?.role ?? "USER")
}
