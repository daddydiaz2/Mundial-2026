<script setup>
useHead({
  titleTemplate: '%s · World Cup 2026',
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { name: 'description', content: 'Predice los resultados del Mundial FIFA 2026 y ganá premios' },
    { name: 'theme-color', content: '#fbbf24' },
    { name: 'mobile-web-app-capable', content: 'yes' },
    { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' },
    { rel: 'manifest', href: '/manifest.json' }
  ],
  htmlAttrs: { lang: 'es' }
})

// Register service worker
onMounted(() => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {})
  }
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
