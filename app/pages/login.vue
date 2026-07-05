<script setup lang="ts">
definePageMeta({ layout: false })

const { login } = useAuth()
const email = ref('')
const password = ref('')
const error = ref('')
const submitting = ref(false)

async function handleLogin() {
  error.value = ''
  submitting.value = true
  try {
    await login(email.value, password.value)
    navigateTo('/predictions')
  } catch (e: any) {
    error.value = e.data?.message || 'Error al iniciar sesión'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center px-4">
    <div class="glass-card w-full max-w-md">
      <h1 class="text-3xl font-bold gradient-text text-center mb-8">Iniciar Sesión</h1>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-sm text-white/60 mb-1">Email</label>
          <input v-model="email" type="email" required
            class="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 focus:border-primary focus:ring-2 focus:ring-primary/50 transition-all outline-none" />
        </div>

        <div>
          <label class="block text-sm text-white/60 mb-1">Contraseña</label>
          <input v-model="password" type="password" required
            class="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 focus:border-primary focus:ring-2 focus:ring-primary/50 transition-all outline-none" />
        </div>

        <p v-if="error" class="text-red-400 text-sm">{{ error }}</p>

        <button type="submit" :disabled="submitting"
          class="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-dark font-bold transition-all hover:scale-105 hover:shadow-lg hover:shadow-primary/50 active:scale-95 disabled:opacity-50">
          {{ submitting ? 'Entrando...' : 'Entrar' }}
        </button>
      </form>

      <p class="text-center text-white/60 mt-6">
        ¿No tenés cuenta?
        <NuxtLink to="/register" class="text-primary hover:underline">Registrate</NuxtLink>
      </p>
    </div>
  </div>
</template>
