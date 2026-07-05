<script setup lang="ts">
import { computed } from 'vue'

const worldcup = useWorldCupStore()

onMounted(async () => {
  if (!worldcup.groups.length) await worldcup.fetchAll()
})

const sortedGroups = computed(() => {
  return [...worldcup.groups]
    .filter(g => g.name && g.teams?.length)
    .sort((a, b) => a.name.localeCompare(b.name))
})

const groupMatchCount = computed(() => {
  const counts: Record<string, number> = {}
  for (const m of worldcup.matches) {
    if (m.type === 'group' && m.group) {
      counts[m.group] = (counts[m.group] || 0) + 1
    }
  }
  return counts
})
</script>

<template>
  <div class="min-h-screen p-4 md:p-8">
    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-10">
        <h1 class="text-4xl md:text-5xl font-bold gradient-text mb-3">Tabla de Posiciones</h1>
        <p class="text-white/60 text-lg">Grupos del Mundial 2026 — 12 grupos, 48 selecciones</p>
      </div>

      <!-- Loading -->
      <div v-if="worldcup.loading" class="text-center py-20">
        <div class="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-white/60">Cargando posiciones...</p>
      </div>

      <!-- Groups Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="group in sortedGroups" :key="group.name">
          <div class="glass-card overflow-hidden">
            <!-- Group Header -->
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-bold">
                Grupo <span class="text-primary">{{ group.name }}</span>
              </h3>
              <span class="text-xs text-white/40">{{ groupMatchCount[group.name] || 0 }} partidos</span>
            </div>

            <!-- Table -->
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b border-white/10">
                    <th class="text-left py-2 pr-3 text-white/50 text-[10px] uppercase tracking-wider">#</th>
                    <th class="text-left py-2 px-2 text-white/50 text-[10px] uppercase tracking-wider">Equipo</th>
                    <th class="text-center py-2 px-1 text-white/50 text-[10px] uppercase tracking-wider">PJ</th>
                    <th class="text-center py-2 px-1 text-white/50 text-[10px] uppercase tracking-wider">G</th>
                    <th class="text-center py-2 px-1 text-white/50 text-[10px] uppercase tracking-wider">E</th>
                    <th class="text-center py-2 px-1 text-white/50 text-[10px] uppercase tracking-wider">P</th>
                    <th class="text-center py-2 px-1 text-white/50 text-[10px] uppercase tracking-wider">GF</th>
                    <th class="text-center py-2 px-1 text-white/50 text-[10px] uppercase tracking-wider">GC</th>
                    <th class="text-center py-2 px-1 text-white/50 text-[10px] uppercase tracking-wider">DG</th>
                    <th class="text-center py-2 pl-1 text-white/50 text-[10px] uppercase tracking-wider font-bold">Pts</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(team, i) in group.teams" :key="team.team_id"
                    class="border-b border-white/5 transition-colors"
                    :class="[
                      'hover:bg-white/5',
                      i < 2 ? 'bg-green-500/5' : '',
                      i >= group.teams.length - 2 ? 'bg-red-500/5' : ''
                    ]">
                    <!-- Position -->
                    <td class="py-2.5 pr-3">
                      <div class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                        :class="{
                          'bg-primary/20 text-primary': i === 0,
                          'bg-white/10 text-white/70': i > 0 && i < group.teams.length - 2,
                          'bg-red-500/20 text-red-400': i >= group.teams.length - 2
                        }">
                        {{ i + 1 }}
                      </div>
                    </td>

                    <!-- Team -->
                    <td class="py-2.5 px-2">
                      <div class="flex items-center gap-2">
                        <img v-if="worldcup.getTeam(team.team_id)"
                          :src="worldcup.getTeam(team.team_id)?.flag"
                          class="w-5 h-5 rounded-full flex-shrink-0" />
                        <span class="font-medium truncate text-xs">
                          {{ worldcup.getTeam(team.team_id)?.name_en || `#${team.team_id}` }}
                        </span>
                      </div>
                    </td>

                    <td class="text-center py-2.5 px-1 text-xs font-mono">{{ team.mp }}</td>
                    <td class="text-center py-2.5 px-1 text-xs font-mono">{{ team.w }}</td>
                    <td class="text-center py-2.5 px-1 text-xs font-mono">{{ team.d }}</td>
                    <td class="text-center py-2.5 px-1 text-xs font-mono">{{ team.l }}</td>
                    <td class="text-center py-2.5 px-1 text-xs font-mono">{{ team.gf }}</td>
                    <td class="text-center py-2.5 px-1 text-xs font-mono">{{ team.ga }}</td>
                    <td class="text-center py-2.5 px-1 text-xs font-mono"
                      :class="Number(team.gd) > 0 ? 'text-green-400' : Number(team.gd) < 0 ? 'text-red-400' : ''">
                      {{ Number(team.gd) > 0 ? '+' : '' }}{{ team.gd }}
                    </td>
                    <td class="text-center py-2.5 pl-1 font-bold text-primary text-sm">{{ team.pts }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Legend -->
            <div class="flex items-center gap-4 mt-4 pt-3 border-t border-white/5 text-[10px] text-white/30">
              <span class="flex items-center gap-1">
                <span class="w-2 h-2 rounded bg-green-500/50"></span> Clasifica
              </span>
              <span class="flex items-center gap-1">
                <span class="w-2 h-2 rounded bg-red-500/50"></span> Eliminado
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
