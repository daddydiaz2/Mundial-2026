import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface Team {
  _id: string
  id: string
  name_en: string
  fifa_code: string
  flag: string
  groups: string
}

interface Match {
  _id: string
  id: string
  home_team_id: string
  away_team_id: string
  home_score: string
  away_score: string
  home_scorers: string
  away_scorers: string
  group: string
  matchday: string
  local_date: string
  stadium_id: string
  finished: string
  time_elapsed: string
  type: string
  home_team_name_en: string
  away_team_name_en: string
}

interface Group {
  _id: string
  name: string
  teams: Array<{
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
}

interface Stadium {
  _id: string
  id: string
  name_en: string
  city_en: string
  country_en: string
  capacity: number
}

export const useWorldCupStore = defineStore('worldcup', () => {
  const teams = ref<Team[]>([])
  const matches = ref<Match[]>([])
  const groups = ref<Group[]>([])
  const stadiums = ref<Stadium[]>([])
  const loading = ref(false)

  const teamMap = computed(() => {
    const map: Record<string, Team> = {}
    teams.value.forEach(t => { map[t.id] = t })
    return map
  })

  function getTeam(id: string) {
    return teamMap.value[id]
  }

  function getMatchesByType(type: string) {
    return matches.value.filter(m => m.type === type)
  }

  function getGroupMatches(groupName: string) {
    return matches.value.filter(m => m.group === groupName)
  }

  function getFinishedMatches() {
    return matches.value.filter(m => m.finished === 'TRUE')
  }

  function getUpcomingMatches() {
    return matches.value.filter(m => m.finished === 'FALSE' && m.time_elapsed === 'notstarted')
  }

  async function fetchAll() {
    loading.value = true
    try {
      const [teamsData, matchesData, groupsData, stadiumsData] = await Promise.all([
        $fetch('/api/worldcup/teams'),
        $fetch('/api/worldcup/matches'),
        $fetch('/api/worldcup/groups'),
        $fetch('/api/worldcup/stadiums')
      ])
      teams.value = (teamsData as any).teams || teamsData
      matches.value = (matchesData as any).games || matchesData
      groups.value = (groupsData as any).groups || groupsData
      stadiums.value = (stadiumsData as any).stadiums || stadiumsData
    } catch (e) {
      console.error('Error fetching world cup data:', e)
    } finally {
      loading.value = false
    }
  }

  return {
    teams, matches, groups, stadiums, loading,
    teamMap, getTeam, getMatchesByType, getGroupMatches,
    getFinishedMatches, getUpcomingMatches, fetchAll
  }
})
