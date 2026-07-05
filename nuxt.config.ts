// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@pinia/nuxt',
    '@sidebase/nuxt-auth'
  ],

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  routeRules: {
    '/': { prerender: true }
  },

  compatibilityDate: '2026-06-30',

  auth: {
    origin: process.env.AUTH_ORIGIN || 'http://localhost:3000',
    session: {
      enableRefreshOnWindowFocus: true,
      enableRefreshPeriodically: false
    }
  },

  runtimeConfig: {
    jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-in-prod',
    vapidPublicKey: process.env.VAPID_PUBLIC_KEY || '',
    vapidPrivateKey: process.env.VAPID_PRIVATE_KEY || '',
    public: {
      vapidPublicKey: process.env.VAPID_PUBLIC_KEY || ''
    }
  },

  nitro: {
    esbuild: {
      options: { target: 'es2020' }
    }
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})
