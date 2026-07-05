<script setup lang="ts">
const props = defineProps<{
  groupName: string
  standings: Array<{
    team_id: string
    mp: string
    w: string
    l: string
    d: string
    pts: string
    gf: string
    ga: string
    gd: string
  }>
}>()

const worldcup = useWorldCupStore()

function getTeam(teamId: string) {
  return worldcup.getTeam(teamId)
}
</script>

<template>
  <div class="glass-card overflow-hidden">
    <h3 class="text-lg font-bold mb-4">Grupo {{ groupName }}</h3>
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-white/10">
            <th class="text-left py-2 px-3 text-white/50">Equipo</th>
            <th class="text-center py-2 px-2 text-white/50">PJ</th>
            <th class="text-center py-2 px-2 text-white/50">G</th>
            <th class="text-center py-2 px-2 text-white/50">E</th>
            <th class="text-center py-2 px-2 text-white/50">P</th>
            <th class="text-center py-2 px-2 text-white/50">GF</th>
            <th class="text-center py-2 px-2 text-white/50">GC</th>
            <th class="text-center py-2 px-2 text-white/50">DG</th>
            <th class="text-center py-2 px-2 text-white/50 font-bold">Pts</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(team, i) in standings" :key="team.team_id"
            class="border-b border-white/5 hover:bg-white/5 transition-colors"
            :class="{ 'bg-green-500/10': i < 2 }">
            <td class="py-2 px-3">
              <div class="flex items-center gap-2">
                <img v-if="getTeam(team.team_id)" :src="getTeam(team.team_id)?.flag" class="w-6 h-6 rounded-full" />
                <span class="font-medium">{{ getTeam(team.team_id)?.name_en || team.team_id }}</span>
              </div>
            </td>
            <td class="text-center py-2 px-2">{{ team.mp }}</td>
            <td class="text-center py-2 px-2">{{ team.w }}</td>
            <td class="text-center py-2 px-2">{{ team.d }}</td>
            <td class="text-center py-2 px-2">{{ team.l }}</td>
            <td class="text-center py-2 px-2">{{ team.gf }}</td>
            <td class="text-center py-2 px-2">{{ team.ga }}</td>
            <td class="text-center py-2 px-2">{{ team.gd }}</td>
            <td class="text-center py-2 px-2 font-bold text-primary">{{ team.pts }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
