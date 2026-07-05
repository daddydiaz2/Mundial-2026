import { useDb, users, desc } from '../../db'

export default defineEventHandler(async (event) => {
  const db = useDb()
  const query = getQuery(event)
  const limit = Number(query.limit) || 50

  const leaderboard = await db.query.users.findMany({
    orderBy: [desc(users.totalPoints), desc(users.accuracy)],
    limit
  })

  return {
    leaderboard: leaderboard.map((u, i) => ({
      rank: i + 1,
      id: u.id,
      username: u.username,
      fullName: u.fullName,
      avatar: u.avatar,
      totalPoints: u.totalPoints,
      accuracy: u.accuracy
    }))
  }
})
