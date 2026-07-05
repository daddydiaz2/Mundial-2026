<script setup lang="ts">
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const { user } = useAuth()

const { data: achievementsData } = await useFetch('/api/achievements')
const { data: statsData } = await useFetch('/api/stats')

const badges = computed(() => (achievementsData.value as any)?.badges || [])
const stats = computed(() => (statsData.value as any) || { total: 0, exact: 0, totalPoints: 0, accuracy: 0, maxStreak: 0 })

const joinedDate = computed(() => {
  if (!user?.createdAt) return 'Desconocido'
  try {
    return format(new Date(user.createdAt), 'dd MMM yyyy', { locale: es })
  } catch {
    return 'Desconocido'
  }
})

const unlockedCount = computed(() => badges.value.filter((b: any) => b.unlocked).length)
</script>

<template>
  <div class="min-h-screen p-4 md:p-8">
    <div class="max-w-4xl mx-auto">
      <!-- Profile Header -->
      <div class="glass-card mb-8 overflow-hidden">
        <div class="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

        <div class="relative">
          <div class="flex flex-col md:flex-row items-center md:items-start gap-6">
            <!-- Avatar -->
            <div class="relative">
              <div class="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-4xl font-bold shadow-xl shadow-primary/30">
                {{ user?.username?.[0]?.toUpperCase() || '?' }}
              </div>
              <div v-if="stats.total > 0" class="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full bg-primary text-dark text-xs font-bold">
                Top {{ user?.rank || '-' }}
              </div>
            </div>

            <!-- Info -->
            <div class="flex-1 text-center md:text-left">
              <h1 class="text-3xl font-bold">{{ user?.fullName }}</h1>
              <p class="text-white/60">@{{ user?.username }}</p>
              <p class="text-sm text-white/40 mt-1">{{ user?.email }}</p>
              <p class="text-xs text-white/30 mt-2">Miembro desde {{ joinedDate }}</p>
            </div>

            <!-- Quick Stats -->
            <div class="flex md:flex-col gap-4">
              <div class="glass rounded-xl px-5 py-3 text-center">
                <div class="text-2xl font-bold text-primary">{{ stats.totalPoints || 0 }}</div>
                <div class="text-xs text-white/50">Puntos</div>
              </div>
              <div class="glass rounded-xl px-5 py-3 text-center">
                <div class="text-2xl font-bold text-green-400">{{ stats.accuracy || 0 }}%</div>
                <div class="text-xs text-white/50">Precisión</div>
              </div>
            </div>
          </div>

          <!-- Stats Grid -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8">
            <div class="text-center p-3 rounded-xl bg-white/5">
              <div class="text-lg font-bold text-blue-400">{{ stats.total }}</div>
              <div class="text-xs text-white/50">Predicciones</div>
            </div>
            <div class="text-center p-3 rounded-xl bg-white/5">
              <div class="text-lg font-bold text-purple-400">{{ stats.exact }}</div>
              <div class="text-xs text-white/50">Exactas</div>
            </div>
            <div class="text-center p-3 rounded-xl bg-white/5">
              <div class="text-lg font-bold text-orange-400">{{ stats.maxStreak }}</div>
              <div class="text-xs text-white/50">Mejor racha</div>
            </div>
            <div class="text-center p-3 rounded-xl bg-white/5">
              <div class="text-lg font-bold text-primary">{{ unlockedCount }}/{{ badges.length }}</div>
              <div class="text-xs text-white/50">Logros</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Badges -->
      <div class="mb-8">
        <Badges :badges="badges" />
      </div>

      <!-- Empty state -->
      <div v-if="stats.total === 0" class="glass-card text-center py-12">
        <div class="text-5xl mb-4">🎯</div>
        <h3 class="text-xl font-bold mb-2">¡Empezá a predecir!</h3>
        <p class="text-white/60">Hacé tus primeras predicciones para ver tu rendimiento</p>
        <NuxtLink to="/predictions" class="inline-block mt-6 px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-dark font-bold transition-all hover:scale-105">
          Ir a Ver Partidos
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
