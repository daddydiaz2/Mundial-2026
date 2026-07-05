import { useDb, users } from '../../db'
import webpush from 'web-push'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  webpush.setVapidDetails(
    'mailto:admin@mundial2026.com',
    config.public.vapidPublicKey,
    config.vapidPrivateKey
  )

  const body = await readBody(event)
  const db = useDb()

  const allUsers = await db.query.users.findMany()
  const results = []

  for (const user of allUsers) {
    if (!user.pushSubscription) continue
    try {
      const subscription = JSON.parse(user.pushSubscription)
      await webpush.sendNotification(
        subscription,
        JSON.stringify({
          title: body.title || 'World Cup 2026',
          message: body.message || '',
          icon: '/favicon.ico'
        })
      )
      results.push({ userId: user.id, status: 'sent' })
    } catch (e) {
      results.push({ userId: user.id, status: 'failed', error: String(e) })
    }
  }

  return {
    sent: results.filter(r => r.status === 'sent').length,
    failed: results.filter(r => r.status === 'failed').length
  }
})
