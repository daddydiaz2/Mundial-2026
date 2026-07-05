import { ref, computed } from 'vue'

interface User {
  id: number
  username: string
  email: string
  fullName: string
  avatar: string
  totalPoints: number
  accuracy: number
  rank: number
  role: string
}

const user = ref<User | null>(null)
const loading = ref(true)

export function useAuth() {
  const isAuthenticated = computed(() => !!user.value)
  const isAdmin = computed(() => user.value?.role === 'admin')

  async function fetchUser() {
    try {
      const data = await $fetch('/api/auth/me')
      user.value = (data as any).user
    } catch {
      user.value = null
    } finally {
      loading.value = false
    }
  }

  async function login(email: string, password: string) {
    const data = await $fetch('/api/auth/login', {
      method: 'POST',
      body: { email, password }
    })
    user.value = (data as any).user
    return data
  }

  async function register(username: string, email: string, password: string, fullName: string) {
    const data = await $fetch('/api/auth/register', {
      method: 'POST',
      body: { username, email, password, fullName }
    })
    return data
  }

  async function logout() {
    await $fetch('/api/auth/logout', { method: 'POST' })
    user.value = null
    navigateTo('/login')
  }

  return { user, loading, isAuthenticated, isAdmin, fetchUser, login, register, logout }
}
