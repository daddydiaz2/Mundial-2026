<script setup lang="ts">
definePageMeta({ layout: false })

const { register } = useAuth()
const form = ref({ username: '', email: '', password: '', fullName: '' })
const error = ref('')
const submitting = ref(false)

async function handleRegister() {
  error.value = ''
  submitting.value = true
  try {
    await register(form.value.username, form.value.email, form.value.password, form.value.fullName)
    navigateTo('/login')
  } catch (e: any) {
    error.value = e.data?.message || 'Error al registrar'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center px-4">
    <div class="glass-card w-full max-w-md">
      <h1 class="text-3xl font-bold gradient-text text-center mb-8">Crear Cuenta</h1>

      <form @submit.prevent="handleRegister" class="space-y-4">
        <div>
          <label class="block text-sm text-white/60 mb-1">Nombre completo</label>
          <input v-model="form.fullName" type="text" required
            class="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 focus:border-primary focus:ring-2 focus:ring-primary/50 transition-all outline-none" />
        </div>

        <div>
          <label class="block text-sm text-white/60 mb-1">Usuario</label>
          <input v-model="form.username" type="text" required minlength="3"
            class="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 focus:border-primary focus:ring-2 focus:ring-primary/50 transition-all outline-none" />
        </div>

        <div>
          <label class="block text-sm text-white/60 mb-1">Email</label>
          <input v-model="form.email" type="email" required
            class="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 focus:border-primary focus:ring-2 focus:ring-primary/50 transition-all outline-none" />
        </div>

        <div>
          <label class="block text-sm text-white/60 mb-1">Contraseña</label>
          <input v-model="form.password" type="password" required minlength="6"
            class="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 focus:border-primary focus:ring-2 focus:ring-primary/50 transition-all outline-none" />
        </div>

        <p v-if="error" class="text-red-400 text-sm">{{ error }}</p>

        <button type="submit" :disabled="submitting"
          class="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-dark font-bold transition-all hover:scale-105 hover:shadow-lg hover:shadow-primary/50 active:scale-95 disabled:opacity-50">
          {{ submitting ? 'Creando...' : 'Crear Cuenta' }}
        </button>
      </form>

      <p class="text-center text-white/60 mt-6">
        ¿Ya tenés cuenta?
        <NuxtLink to="/login" class="text-primary hover:underline">Iniciá sesión</NuxtLink>
      </p>
    </div>
  </div>
</template>
