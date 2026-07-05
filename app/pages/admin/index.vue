<script setup lang="ts">
const { user, isAdmin } = useAuth()

if (!isAdmin.value) {
  navigateTo('/')
}

const { data: stats } = await useFetch('/api/admin/stats')
const { data: usersData } = await useFetch('/api/admin/users')

const users = computed(() => (usersData.value as any)?.users || [])
</script>

<template>
  <div class="min-h-screen p-4 md:p-8">
    <div class="max-w-7xl mx-auto">
      <h1 class="text-4xl font-bold gradient-text mb-2">Panel de Admin</h1>
      <p class="text-white/60 mb-8">Gestión del Mundial 2026</p>

      <!-- Stats cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div class="glass-card text-center">
          <div class="text-3xl font-bold text-primary">{{ (stats as any)?.totalUsers || 0 }}</div>
          <div class="text-sm text-white/50">Usuarios</div>
        </div>
        <div class="glass-card text-center">
          <div class="text-3xl font-bold text-green-400">{{ (stats as any)?.totalPredictions || 0 }}</div>
          <div class="text-sm text-white/50">Predicciones</div>
        </div>
        <div class="glass-card text-center">
          <div class="text-3xl font-bold text-blue-400">{{ (stats as any)?.totalPoints || 0 }}</div>
          <div class="text-sm text-white/50">Puntos Totales</div>
        </div>
      </div>

      <!-- Users table -->
      <div class="glass-card">
        <h2 class="text-2xl font-bold mb-4">Usuarios</h2>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-white/10">
                <th class="text-left py-2 px-3 text-white/50">ID</th>
                <th class="text-left py-2 px-3 text-white/50">Usuario</th>
                <th class="text-left py-2 px-3 text-white/50">Email</th>
                <th class="text-left py-2 px-3 text-white/50">Nombre</th>
                <th class="text-center py-2 px-3 text-white/50">Puntos</th>
                <th class="text-center py-2 px-3 text-white/50">Rol</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="u in users" :key="u.id" class="border-b border-white/5 hover:bg-white/5">
                <td class="py-2 px-3">{{ u.id }}</td>
                <td class="py-2 px-3 font-medium">{{ u.username }}</td>
                <td class="py-2 px-3 text-white/60">{{ u.email }}</td>
                <td class="py-2 px-3">{{ u.fullName }}</td>
                <td class="text-center py-2 px-3 text-primary font-bold">{{ u.totalPoints }}</td>
                <td class="text-center py-2 px-3">
                  <span :class="u.role === 'admin' ? 'text-red-400' : 'text-white/50'">
                    {{ u.role || 'user' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
