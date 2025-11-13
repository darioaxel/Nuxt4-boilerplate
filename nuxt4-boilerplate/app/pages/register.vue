<template>
  <div class="flex flex-col items-center justify-center min-h-screen">
    <h1 class="text-2xl mb-4">Registro</h1>

    <form @submit.prevent="registerUser" class="flex flex-col gap-3 w-64">
      <input v-model="email" type="email" placeholder="Email" class="border p-2 rounded">
      <input v-model="password" type="password" placeholder="Contraseña" class="border p-2 rounded">
      <button class="bg-green-600 text-white p-2 rounded">Crear cuenta</button>
    </form>

    <p v-if="msg" class="mt-4 text-green-600">{{ msg }}</p>
    <p v-if="errorMessage" class="mt-4 text-red-600">{{ errorMessage }}</p>
  </div>
</template>

<script setup>
const email = ref('')
const password = ref('')
const msg = ref('')
const errorMessage = ref('')

const registerUser = async () => {
  msg.value = ''
  errorMessage.value = ''

  const { data, error } = await useFetch('/api/auth/register', {
    method: 'POST',
    body: { email: email.value, password: password.value }
  })

  if (error.value) {
    errorMessage.value = error.value.data.message
    return
  }

  msg.value = 'Registro correcto. Ahora puedes iniciar sesión.'
}
</script>
