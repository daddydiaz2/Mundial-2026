export function useNotifications() {
  const vapidPublicKey = ref('')

  async function fetchVapidKey() {
    const data = await $fetch('/api/notifications/vapid-key')
    vapidPublicKey.value = (data as any).publicKey
  }

  async function subscribe() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push notifications not supported')
      return
    }

    await fetchVapidKey()
    if (!vapidPublicKey.value) return

    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: vapidPublicKey.value
    })

    await $fetch('/api/notifications/subscribe', {
      method: 'POST',
      body: { subscription }
    })

    return subscription
  }

  async function requestPermission() {
    const permission = await Notification.requestPermission()
    if (permission === 'granted') {
      await subscribe()
    }
    return permission
  }

  return { requestPermission, subscribe }
}
