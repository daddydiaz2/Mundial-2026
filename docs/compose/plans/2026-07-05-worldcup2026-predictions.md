# World Cup 2026 Predictions — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use compose:subagent (recommended) or compose:execute to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a full-featured World Cup 2026 predictions app with auth, match predictions, animated bracket, leaderboard, statistics, push notifications, and a modern glassmorphism UI.

**Architecture:** Nuxt 4 + Nuxt UI v4 frontend with SQLite (Drizzle ORM) backend. External data from worldcup26.ir free API. JWT auth via @sidebase/nuxt-auth. Push notifications via Web Push API.

**Tech Stack:** Nuxt 4, @nuxt/ui v4, Tailwind CSS v4, SQLite, Drizzle ORM, @sidebase/nuxt-auth, Pinia, Chart.js, canvas-confetti, date-fns, web-push

## Global Constraints

- Nuxt 4 with `app/` directory structure (pages, components, composables, stores inside `app/`)
- Server directory at project root (`server/`)
- SQLite with WAL mode, better-sqlite3
- Dark mode by default, glassmorphism UI
- Spanish language for UI text
- External API: worldcup26.ir (no auth key needed for read)
- Deploy target: Railway with Docker

---

### Task 1: Project Setup & Dependencies

**Covers:** [S1, S9]

**Files:**
- Modify: `package.json`
- Modify: `nuxt.config.ts`
- Create: `app/assets/css/main.css`
- Create: `.env`

**Interfaces:**
- Produces: Working Nuxt 4 project with all dependencies installed

- [ ] **Step 1: Install dependencies**

```bash
cd /home/daniel/Proyectos/vue/mundial-2026
pnpm add drizzle-orm better-sqlite3 @sidebase/nuxt-auth @pinia/nuxt pinia chart.js vue-chartjs canvas-confetti date-fns web-push
pnpm add -D drizzle-kit @types/better-sqlite3 @types/web-push
```

- [ ] **Step 2: Update nuxt.config.ts**

```typescript
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@pinia/nuxt',
    '@sidebase/nuxt-auth'
  ],

  devtools: { enabled: true },

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
```

- [ ] **Step 3: Create app/assets/css/main.css**

```css
@import "tailwindcss";

:root {
  --color-primary: #fbbf24;
  --color-primary-dark: #f59e0b;
  --color-secondary: #3b82f6;
  --color-accent: #8b5cf6;
  --color-dark: #0f172a;
  --color-dark-light: #1e293b;
}

body {
  background-color: var(--color-dark);
  color: white;
  font-family: system-ui, -apple-system, sans-serif;
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
}

::-webkit-scrollbar { width: 8px; height: 8px; }
::-webkit-scrollbar-track { background: var(--color-dark-light); }
::-webkit-scrollbar-thumb { background: var(--color-primary); border-radius: 9999px; }
::-webkit-scrollbar-thumb:hover { background: var(--color-primary-dark); }

.glass {
  background: rgba(255,255,255,0.05);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255,255,255,0.1);
}

.glass-card {
  background: rgba(255,255,255,0.05);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
}

.gradient-text {
  background: linear-gradient(to right, var(--color-primary), var(--color-secondary), var(--color-accent));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.animate-float { animation: float 6s ease-in-out infinite; }
.animate-glow { animation: glow 2s ease-in-out infinite alternate; }

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

@keyframes glow {
  from { box-shadow: 0 0 10px rgba(251,191,36,0.5); }
  to { box-shadow: 0 0 30px rgba(251,191,36,0.8), 0 0 50px rgba(251,191,36,0.4); }
}

.page-enter-active, .page-leave-active { transition: all 0.3s ease; }
.page-enter-from, .page-leave-to { opacity: 0; transform: translateY(10px); }
```

- [ ] **Step 4: Create .env**

```env
DATABASE_URL=./data/worldcup.db
JWT_SECRET=dev-secret-change-in-prod
NUXT_AUTH_SECRET=dev-auth-secret-change-in-prod
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
AUTH_ORIGIN=http://localhost:3000
```

- [ ] **Step 5: Verify dev server starts**

```bash
pnpm dev
```

Expected: Server starts on http://localhost:3000 without errors.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: project setup with Nuxt 4, Nuxt UI, Drizzle, auth deps"
```

---

### Task 2: Database Schema & Connection

**Covers:** [S2]

**Files:**
- Create: `server/db/schema.ts`
- Create: `server/db/index.ts`
- Create: `drizzle.config.ts`
- Create: `server/db/migrations/` (auto-generated)

**Interfaces:**
- Produces: `useDb()` function, schema exports (users, predictions, notifications, achievements)

- [ ] **Step 1: Create drizzle.config.ts**

```typescript
import type { Config } from 'drizzle-kit'

export default {
  schema: './server/db/schema.ts',
  out: './server/db/migrations',
  dialect: 'sqlite',
  dbCredentials: {
    url: process.env.DATABASE_URL || './data/worldcup.db'
  }
} satisfies Config
```

- [ ] **Step 2: Create server/db/schema.ts**

```typescript
import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  fullName: text('full_name').notNull(),
  avatar: text('avatar').default('/avatars/default.png'),
  totalPoints: integer('total_points').default(0),
  accuracy: real('accuracy').default(0),
  rank: integer('rank').default(0),
  pushSubscription: text('push_subscription'),
  role: text('role').default('user'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`)
})

export const predictions = sqliteTable('predictions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  matchId: text('match_id').notNull(),
  homeScore: integer('home_score').notNull(),
  awayScore: integer('away_score').notNull(),
  points: integer('points').default(0),
  isExact: integer('is_exact').default(0),
  isResult: integer('is_result').default(0),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`)
})

export const notifications = sqliteTable('notifications', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').references(() => users.id),
  title: text('title').notNull(),
  message: text('message').notNull(),
  type: text('type').notNull(),
  read: integer('read').default(0),
  matchId: text('match_id'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`)
})

export const achievements = sqliteTable('achievements', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  badgeType: text('badge_type').notNull(),
  unlockedAt: text('unlocked_at').default(sql`CURRENT_TIMESTAMP`)
})

export type User = typeof users.$inferSelect
export type Prediction = typeof predictions.$inferSelect
export type Notification = typeof notifications.$inferSelect
export type Achievement = typeof achievements.$inferSelect
```

- [ ] **Step 3: Create server/db/index.ts**

```typescript
import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import * as schema from './schema'
import { mkdirSync } from 'fs'
import { dirname } from 'path'

let db: ReturnType<typeof drizzle>

export function useDb() {
  if (!db) {
    const dbPath = process.env.DATABASE_URL || './data/worldcup.db'
    mkdirSync(dirname(dbPath), { recursive: true })
    const sqlite = new Database(dbPath)
    sqlite.pragma('journal_mode = WAL')
    sqlite.pragma('synchronous = NORMAL')
    db = drizzle(sqlite, { schema })
  }
  return db
}

export { sql, eq, and, or, desc, asc, gt, lt, gte, lte, inArray, count } from 'drizzle-orm'
```

- [ ] **Step 4: Generate and run migrations**

```bash
pnpm drizzle-kit generate
pnpm drizzle-kit push
```

Expected: Migration files created in `server/db/migrations/`, tables created in SQLite.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: database schema with Drizzle ORM (users, predictions, notifications, achievements)"
```

---

### Task 3: Auth System (Register/Login)

**Covers:** [S5, S7 F1]

**Files:**
- Create: `server/api/auth/register.post.ts`
- Create: `server/api/auth/login.post.ts`
- Create: `server/api/auth/logout.post.ts`
- Create: `server/api/auth/me.get.ts`
- Create: `server/utils/scoring.ts` (placeholder)
- Create: `app/composables/useAuth.ts`
- Create: `app/pages/login.vue`
- Create: `app/pages/register.vue`
- Create: `app/components/auth/AuthForm.vue`

**Interfaces:**
- Consumes: `useDb()`, schema from Task 2
- Produces: Auth API endpoints, login/register pages, `useAuth()` composable

- [ ] **Step 1: Create server/api/auth/register.post.ts**

```typescript
import { useDb, users, eq, or } from '~/server/db'
import { hash } from 'bcryptjs'

export default defineEventHandler(async (event) => {
  const db = useDb()
  const body = await readBody(event)

  const { username, email, password, fullName } = body

  if (!username || !email || !password || !fullName) {
    throw createError({ statusCode: 400, message: 'Todos los campos son requeridos' })
  }

  if (password.length < 6) {
    throw createError({ statusCode: 400, message: 'La contraseña debe tener al menos 6 caracteres' })
  }

  const existing = await db.query.users.findFirst({
    where: or(eq(users.username, username), eq(users.email, email))
  })

  if (existing) {
    throw createError({ statusCode: 409, message: 'El usuario o email ya existe' })
  }

  const passwordHash = await hash(password, 10)

  const result = await db.insert(users).values({
    username,
    email,
    passwordHash,
    fullName
  }).returning({
    id: users.id,
    username: users.username,
    email: users.email,
    fullName: users.fullName,
    avatar: users.avatar
  })

  return { user: result[0] }
})
```

- [ ] **Step 2: Create server/api/auth/login.post.ts**

```typescript
import { useDb, users, eq } from '~/server/db'
import { compare } from 'bcryptjs'
import { SignJWT } from 'jose'

export default defineEventHandler(async (event) => {
  const db = useDb()
  const body = await readBody(event)
  const config = useRuntimeConfig()

  const { email, password } = body

  if (!email || !password) {
    throw createError({ statusCode: 400, message: 'Email y contraseña son requeridos' })
  }

  const user = await db.query.users.findFirst({
    where: eq(users.email, email)
  })

  if (!user) {
    throw createError({ statusCode: 401, message: 'Credenciales inválidas' })
  }

  const valid = await compare(password, user.passwordHash)
  if (!valid) {
    throw createError({ statusCode: 401, message: 'Credenciales inválidas' })
  }

  const secret = new TextEncoder().encode(config.jwtSecret)
  const token = await new SignJWT({ userId: user.id, username: user.username })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(secret)

  setCookie(event, 'auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7,
    path: '/'
  })

  return {
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      avatar: user.avatar,
      role: user.role
    }
  }
})
```

- [ ] **Step 3: Create server/api/auth/logout.post.ts**

```typescript
export default defineEventHandler(async (event) => {
  deleteCookie(event, 'auth-token', { path: '/' })
  return { success: true }
})
```

- [ ] **Step 4: Create server/api/auth/me.get.ts**

```typescript
import { useDb, users, eq } from '~/server/db'
import { jwtVerify } from 'jose'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const token = getCookie(event, 'auth-token')

  if (!token) {
    throw createError({ statusCode: 401, message: 'No autenticado' })
  }

  try {
    const secret = new TextEncoder().encode(config.jwtSecret)
    const { payload } = await jwtVerify(token, secret)
    const db = useDb()

    const user = await db.query.users.findFirst({
      where: eq(users.id, payload.userId as number)
    })

    if (!user) {
      throw createError({ statusCode: 401, message: 'Usuario no encontrado' })
    }

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        avatar: user.avatar,
        totalPoints: user.totalPoints,
        accuracy: user.accuracy,
        rank: user.rank,
        role: user.role
      }
    }
  } catch {
    throw createError({ statusCode: 401, message: 'Token inválido' })
  }
})
```

- [ ] **Step 5: Install jose for JWT**

```bash
pnpm add jose
```

- [ ] **Step 6: Create app/composables/useAuth.ts**

```typescript
import { ref, computed } from 'vue'

interface User {
  id: number
  username: string
  email: string
  fullName: string
  avatar: string
  totalPoints: number
  accuracy: number
  rank: number
  role: string
}

const user = ref<User | null>(null)
const loading = ref(true)

export function useAuth() {
  const isAuthenticated = computed(() => !!user.value)
  const isAdmin = computed(() => user.value?.role === 'admin')

  async function fetchUser() {
    try {
      const data = await $fetch('/api/auth/me')
      user.value = data.user
    } catch {
      user.value = null
    } finally {
      loading.value = false
    }
  }

  async function login(email: string, password: string) {
    const data = await $fetch('/api/auth/login', {
      method: 'POST',
      body: { email, password }
    })
    user.value = data.user
    return data
  }

  async function register(username: string, email: string, password: string, fullName: string) {
    const data = await $fetch('/api/auth/register', {
      method: 'POST',
      body: { username, email, password, fullName }
    })
    return data
  }

  async function logout() {
    await $fetch('/api/auth/logout', { method: 'POST' })
    user.value = null
    navigateTo('/login')
  }

  return { user, loading, isAuthenticated, isAdmin, fetchUser, login, register, logout }
}
```

- [ ] **Step 7: Create app/pages/login.vue**

```vue
<script setup lang="ts">
definePageMeta({ layout: false })

const { login } = useAuth()
const email = ref('')
const password = ref('')
const error = ref('')
const submitting = ref(false)

async function handleLogin() {
  error.value = ''
  submitting.value = true
  try {
    await login(email.value, password.value)
    navigateTo('/predictions')
  } catch (e: any) {
    error.value = e.data?.message || 'Error al iniciar sesión'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center px-4">
    <div class="glass-card w-full max-w-md">
      <h1 class="text-3xl font-bold gradient-text text-center mb-8">Iniciar Sesión</h1>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-sm text-white/60 mb-1">Email</label>
          <input v-model="email" type="email" required
            class="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 focus:border-primary focus:ring-2 focus:ring-primary/50 transition-all outline-none" />
        </div>

        <div>
          <label class="block text-sm text-white/60 mb-1">Contraseña</label>
          <input v-model="password" type="password" required
            class="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 focus:border-primary focus:ring-2 focus:ring-primary/50 transition-all outline-none" />
        </div>

        <p v-if="error" class="text-red-400 text-sm">{{ error }}</p>

        <button type="submit" :disabled="submitting"
          class="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-dark font-bold transition-all hover:scale-105 hover:shadow-lg hover:shadow-primary/50 active:scale-95 disabled:opacity-50">
          {{ submitting ? 'Entrando...' : 'Entrar' }}
        </button>
      </form>

      <p class="text-center text-white/60 mt-6">
        ¿No tenés cuenta?
        <NuxtLink to="/register" class="text-primary hover:underline">Registrate</NuxtLink>
      </p>
    </div>
  </div>
</template>
```

- [ ] **Step 8: Create app/pages/register.vue**

```vue
<script setup lang="ts">
definePageMeta({ layout: false })

const { register } = useAuth()
const form = ref({ username: '', email: '', password: '', fullName: '' })
const error = ref('')
const submitting = ref(false)

async function handleRegister() {
  error.value = ''
  submitting.value = true
  try {
    await register(form.value.username, form.value.email, form.value.password, form.value.fullName)
    navigateTo('/login')
  } catch (e: any) {
    error.value = e.data?.message || 'Error al registrar'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center px-4">
    <div class="glass-card w-full max-w-md">
      <h1 class="text-3xl font-bold gradient-text text-center mb-8">Crear Cuenta</h1>

      <form @submit.prevent="handleRegister" class="space-y-4">
        <div>
          <label class="block text-sm text-white/60 mb-1">Nombre completo</label>
          <input v-model="form.fullName" type="text" required
            class="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 focus:border-primary focus:ring-2 focus:ring-primary/50 transition-all outline-none" />
        </div>

        <div>
          <label class="block text-sm text-white/60 mb-1">Usuario</label>
          <input v-model="form.username" type="text" required minlength="3"
            class="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 focus:border-primary focus:ring-2 focus:ring-primary/50 transition-all outline-none" />
        </div>

        <div>
          <label class="block text-sm text-white/60 mb-1">Email</label>
          <input v-model="form.email" type="email" required
            class="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 focus:border-primary focus:ring-2 focus:ring-primary/50 transition-all outline-none" />
        </div>

        <div>
          <label class="block text-sm text-white/60 mb-1">Contraseña</label>
          <input v-model="form.password" type="password" required minlength="6"
            class="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 focus:border-primary focus:ring-2 focus:ring-primary/50 transition-all outline-none" />
        </div>

        <p v-if="error" class="text-red-400 text-sm">{{ error }}</p>

        <button type="submit" :disabled="submitting"
          class="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-dark font-bold transition-all hover:scale-105 hover:shadow-lg hover:shadow-primary/50 active:scale-95 disabled:opacity-50">
          {{ submitting ? 'Creando...' : 'Crear Cuenta' }}
        </button>
      </form>

      <p class="text-center text-white/60 mt-6">
        ¿Ya tenés cuenta?
        <NuxtLink to="/login" class="text-primary hover:underline">Iniciá sesión</NuxtLink>
      </p>
    </div>
  </div>
</template>
```

- [ ] **Step 9: Test auth flow**

Start dev server, navigate to /register, create account, login, verify redirect to /predictions.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat: auth system with register, login, JWT cookies"
```

---

### Task 4: World Cup Data Composable & API Proxy

**Covers:** [S4]

**Files:**
- Create: `server/api/worldcup/teams.get.ts`
- Create: `server/api/worldcup/groups.get.ts`
- Create: `server/api/worldcup/matches.get.ts`
- Create: `server/api/worldcup/stadiums.get.ts`
- Create: `app/composables/useWorldCupData.ts`
- Create: `app/stores/worldcup.ts`

**Interfaces:**
- Produces: Cached worldcup data store, proxy endpoints for external API

- [ ] **Step 1: Create server/api/worldcup/teams.get.ts**

```typescript
export default defineEventHandler(async () => {
  const data = await $fetch('https://worldcup26.ir/get/teams')
  return data
})
```

- [ ] **Step 2: Create server/api/worldcup/groups.get.ts**

```typescript
export default defineEventHandler(async () => {
  const data = await $fetch('https://worldcup26.ir/get/groups')
  return data
})
```

- [ ] **Step 3: Create server/api/worldcup/matches.get.ts**

```typescript
export default defineEventHandler(async () => {
  const data = await $fetch('https://worldcup26.ir/get/games')
  return data
})
```

- [ ] **Step 4: Create server/api/worldcup/stadiums.get.ts**

```typescript
export default defineEventHandler(async () => {
  const data = await $fetch('https://worldcup26.ir/get/stadiums')
  return data
})
```

- [ ] **Step 5: Create app/stores/worldcup.ts**

```typescript
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
```

- [ ] **Step 6: Test data fetching**

```bash
pnpm dev
```

Navigate to /predictions, verify data loads from API.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: worldcup data store and API proxy endpoints"
```

---

### Task 5: Predictions API & Logic

**Covers:** [S3, S6, S7 F2]

**Files:**
- Create: `server/api/predictions/index.get.ts`
- Create: `server/api/predictions/index.post.ts`
- Create: `server/api/predictions/[matchId].put.ts`
- Create: `server/utils/scoring.ts`
- Modify: `app/stores/predictions.ts` (create)

**Interfaces:**
- Consumes: `useDb()`, schema, worldcup store
- Produces: Prediction CRUD API, scoring logic, predictions store

- [ ] **Step 1: Create server/utils/scoring.ts**

```typescript
export function calculatePoints(
  predictedHome: number,
  predictedAway: number,
  actualHome: number,
  actualAway: number
): { points: number; isExact: boolean; isResult: boolean } {
  const isExact = predictedHome === actualHome && predictedAway === actualAway
  const predictedResult = Math.sign(predictedHome - predictedAway)
  const actualResult = Math.sign(actualHome - actualAway)
  const isResult = predictedResult === actualResult

  return {
    points: isExact ? 3 : isResult ? 1 : 0,
    isExact: isExact ? 1 : 0,
    isResult: isResult ? 1 : 0
  }
}
```

- [ ] **Step 2: Create server/api/predictions/index.get.ts**

```typescript
import { useDb, predictions, eq } from '~/server/db'
import { jwtVerify } from 'jose'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const token = getCookie(event, 'auth-token')

  if (!token) {
    throw createError({ statusCode: 401, message: 'No autenticado' })
  }

  const secret = new TextEncoder().encode(config.jwtSecret)
  const { payload } = await jwtVerify(token, secret)
  const db = useDb()

  const userPredictions = await db.query.predictions.findMany({
    where: eq(predictions.userId, payload.userId as number)
  })

  return { predictions: userPredictions }
})
```

- [ ] **Step 3: Create server/api/predictions/index.post.ts**

```typescript
import { useDb, predictions, eq, and } from '~/server/db'
import { jwtVerify } from 'jose'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const token = getCookie(event, 'auth-token')

  if (!token) {
    throw createError({ statusCode: 401, message: 'No autenticado' })
  }

  const secret = new TextEncoder().encode(config.jwtSecret)
  const { payload } = await jwtVerify(token, secret)
  const body = await readBody(event)
  const db = useDb()

  const { matchId, homeScore, awayScore } = body

  if (homeScore === undefined || awayScore === undefined) {
    throw createError({ statusCode: 400, message: 'Score requerido' })
  }

  // Check if prediction already exists
  const existing = await db.query.predictions.findFirst({
    where: and(
      eq(predictions.userId, payload.userId as number),
      eq(predictions.matchId, matchId)
    )
  })

  if (existing) {
    throw createError({ statusCode: 409, message: 'Ya tenés una predicción para este partido' })
  }

  const result = await db.insert(predictions).values({
    userId: payload.userId as number,
    matchId,
    homeScore,
    awayScore
  }).returning()

  return { prediction: result[0] }
})
```

- [ ] **Step 4: Create server/api/predictions/[matchId].put.ts**

```typescript
import { useDb, predictions, eq, and } from '~/server/db'
import { jwtVerify } from 'jose'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const token = getCookie(event, 'auth-token')

  if (!token) {
    throw createError({ statusCode: 401, message: 'No autenticado' })
  }

  const secret = new TextEncoder().encode(config.jwtSecret)
  const { payload } = await jwtVerify(token, secret)
  const body = await readBody(event)
  const matchId = getRouterParam(event, 'matchId')
  const db = useDb()

  const { homeScore, awayScore } = body

  const result = await db.update(predictions)
    .set({ homeScore, awayScore })
    .where(and(
      eq(predictions.userId, payload.userId as number),
      eq(predictions.matchId, matchId!)
    ))
    .returning()

  return { prediction: result[0] }
})
```

- [ ] **Step 5: Create app/stores/predictions.ts**

```typescript
import { defineStore } from 'pinia'
import { ref } from 'vue'

interface Prediction {
  id: number
  userId: number
  matchId: string
  homeScore: number
  awayScore: number
  points: number
  isExact: number
  isResult: number
}

export const usePredictionsStore = defineStore('predictions', () => {
  const predictions = ref<Prediction[]>([])
  const loading = ref(false)

  function getPrediction(matchId: string) {
    return predictions.value.find(p => p.matchId === matchId)
  }

  async function fetchPredictions() {
    loading.value = true
    try {
      const data = await $fetch('/api/predictions')
      predictions.value = (data as any).predictions
    } catch (e) {
      console.error('Error fetching predictions:', e)
    } finally {
      loading.value = false
    }
  }

  async function makePrediction(matchId: string, homeScore: number, awayScore: number) {
    const data = await $fetch('/api/predictions', {
      method: 'POST',
      body: { matchId, homeScore, awayScore }
    })
    predictions.value.push((data as any).prediction)
    return data
  }

  async function updatePrediction(matchId: string, homeScore: number, awayScore: number) {
    const data = await $fetch(`/api/predictions/${matchId}`, {
      method: 'PUT',
      body: { homeScore, awayScore }
    })
    const idx = predictions.value.findIndex(p => p.matchId === matchId)
    if (idx >= 0) {
      predictions.value[idx] = (data as any).prediction
    }
    return data
  }

  return { predictions, loading, getPrediction, fetchPredictions, makePrediction, updatePrediction }
})
```

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: predictions API with scoring logic and Pinia store"
```

---

### Task 6: Match Cards & Predictions UI

**Covers:** [S7 F2, S8]

**Files:**
- Create: `app/components/matches/MatchCard.vue`
- Create: `app/components/matches/PredictionDialog.vue`
- Modify: `app/pages/predictions/index.vue`

**Interfaces:**
- Consumes: worldcup store, predictions store
- Produces: MatchCard component, PredictionDialog, predictions page

- [ ] **Step 1: Create app/components/matches/MatchCard.vue**

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const props = defineProps<{
  match: any
  prediction?: any
}>()

const emit = defineEmits<{ predict: [match: any] }>()

const worldcup = useWorldCupStore()

const homeTeam = computed(() => worldcup.getTeam(props.match.home_team_id))
const awayTeam = computed(() => worldcup.getTeam(props.match.away_team_id))

const isFinished = computed(() => props.match.finished === 'TRUE')
const isLive = computed(() => !isFinished.value && props.match.time_elapsed !== 'notstarted')

const phaseLabel = computed(() => {
  const labels: Record<string, string> = {
    group: 'Fase de Grupos', r32: 'Ronda de 32', r16: 'Octavos',
    qf: 'Cuartos', sf: 'Semifinal', final: 'Final', third: 'Tercer Puesto'
  }
  return labels[props.match.type] || props.match.type
})

const formattedDate = computed(() => {
  try {
    const [datePart, timePart] = props.match.local_date.split(' ')
    const [month, day, year] = datePart.split('/')
    return format(new Date(`${year}-${month}-${day}T${timePart}`), 'dd MMM yyyy - HH:mm', { locale: es })
  } catch {
    return props.match.local_date
  }
})
</script>

<template>
  <div class="glass-card relative overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
    :class="{ 'border-2 border-red-500/50': isLive }">

    <!-- Phase badge -->
    <div class="absolute top-3 right-3">
      <span class="px-2 py-0.5 rounded-full text-xs font-bold bg-white/10 text-white/60">{{ phaseLabel }}</span>
    </div>

    <!-- Date & Stadium -->
    <div class="text-xs text-white/50 mb-4 space-y-1">
      <div>{{ formattedDate }}</div>
    </div>

    <!-- Teams -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex-1 text-center">
        <img v-if="homeTeam" :src="homeTeam.flag" :alt="homeTeam.name_en"
          class="w-12 h-12 rounded-full mx-auto mb-2 border-2 border-white/20" />
        <div class="font-bold text-sm">{{ match.home_team_name_en }}</div>
        <div class="text-xs text-white/50">{{ homeTeam?.fifa_code }}</div>
      </div>

      <div class="px-6">
        <template v-if="isFinished">
          <div class="text-3xl font-bold gradient-text">{{ match.home_score }} - {{ match.away_score }}</div>
        </template>
        <template v-else-if="isLive">
          <div class="text-2xl font-bold text-red-500 animate-pulse">{{ match.home_score }} - {{ match.away_score }}</div>
          <div class="text-xs text-red-400 text-center">EN VIVO</div>
        </template>
        <template v-else>
          <div class="text-xl font-bold text-white/30">VS</div>
        </template>
      </div>

      <div class="flex-1 text-center">
        <img v-if="awayTeam" :src="awayTeam.flag" :alt="awayTeam.name_en"
          class="w-12 h-12 rounded-full mx-auto mb-2 border-2 border-white/20" />
        <div class="font-bold text-sm">{{ match.away_team_name_en }}</div>
        <div class="text-xs text-white/50">{{ awayTeam?.fifa_code }}</div>
      </div>
    </div>

    <!-- Scoring info -->
    <div v-if="prediction && isFinished" class="text-center mb-3">
      <span :class="prediction.points > 0 ? 'text-green-400' : 'text-red-400'" class="text-sm font-bold">
        {{ prediction.points > 0 ? `+${prediction.points} pts` : '0 pts' }}
      </span>
    </div>

    <!-- Prediction display -->
    <div v-if="prediction && !isFinished" class="text-center mb-3 text-sm text-white/60">
      Tu predicción: <span class="font-bold text-white">{{ prediction.homeScore }} - {{ prediction.awayScore }}</span>
    </div>

    <!-- Action button -->
    <button v-if="!isFinished && !prediction"
      @click="emit('predict', match)"
      class="w-full py-2.5 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-dark font-bold transition-all hover:scale-105 active:scale-95">
      Hacer Predicción
    </button>
    <button v-else-if="!isFinished && prediction"
      @click="emit('predict', match)"
      class="w-full py-2.5 rounded-xl bg-white/10 text-white/60 font-semibold transition-all hover:bg-white/20">
      Editar Predicción
    </button>
  </div>
</template>
```

- [ ] **Step 2: Create app/components/matches/PredictionDialog.vue**

```vue
<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  open: boolean
  match: any
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  submit: [homeScore: number, awayScore: number]
}>()

const homeScore = ref(0)
const awayScore = ref(0)

watch(() => props.open, (val) => {
  if (val) {
    homeScore.value = 0
    awayScore.value = 0
  }
})

function handleSubmit() {
  emit('submit', homeScore.value, awayScore.value)
  emit('update:open', false)
}

const quickScores = [
  { home: 1, away: 0 },
  { home: 2, away: 1 },
  { home: 1, away: 1 },
  { home: 2, away: 0 },
  { home: 3, away: 1 },
  { home: 0, away: 1 }
]
</script>

<template>
  <UModal :open="open" @update:open="emit('update:open', $event)">
    <template #header>
      <h3 class="text-xl font-bold gradient-text">Hacer Predicción</h3>
    </template>

    <template v-if="match">
      <!-- Match info -->
      <div class="text-center mb-6">
        <div class="flex items-center justify-center gap-6">
          <div class="text-center">
            <div class="font-bold">{{ match.home_team_name_en }}</div>
          </div>
          <div class="text-xl font-bold text-white/30">VS</div>
          <div class="text-center">
            <div class="font-bold">{{ match.away_team_name_en }}</div>
          </div>
        </div>
      </div>

      <!-- Score inputs -->
      <div class="flex items-center justify-center gap-4 mb-6">
        <div class="text-center">
          <p class="text-xs text-white/50 mb-2">Local</p>
          <input v-model.number="homeScore" type="number" min="0" max="20"
            class="w-20 h-20 text-center text-3xl font-bold bg-white/10 rounded-xl border border-white/20 focus:border-primary focus:ring-2 focus:ring-primary/50 transition-all outline-none" />
        </div>
        <div class="text-2xl font-bold text-white/30">-</div>
        <div class="text-center">
          <p class="text-xs text-white/50 mb-2">Visitante</p>
          <input v-model.number="awayScore" type="number" min="0" max="20"
            class="w-20 h-20 text-center text-3xl font-bold bg-white/10 rounded-xl border border-white/20 focus:border-primary focus:ring-2 focus:ring-primary/50 transition-all outline-none" />
        </div>
      </div>

      <!-- Quick scores -->
      <div class="flex flex-wrap gap-2 justify-center">
        <button v-for="score in quickScores" :key="`${score.home}-${score.away}`"
          @click="homeScore = score.home; awayScore = score.away"
          class="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-sm">
          {{ score.home }}-{{ score.away }}
        </button>
      </div>
    </template>

    <template #footer>
      <div class="flex gap-3 justify-end">
        <UButton @click="emit('update:open', false)" color="neutral" variant="outline">Cancelar</UButton>
        <UButton @click="handleSubmit" color="primary">Confirmar</UButton>
      </div>
    </template>
  </UModal>
</template>
```

- [ ] **Step 3: Create app/pages/predictions/index.vue**

```vue
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import confetti from 'canvas-confetti'

const worldcup = useWorldCupStore()
const predictionsStore = usePredictionsStore()
const { user } = useAuth()

const showDialog = ref(false)
const selectedMatch = ref<any>(null)

onMounted(async () => {
  await Promise.all([worldcup.fetchAll(), predictionsStore.fetchPredictions()])
})

function openPrediction(match: any) {
  selectedMatch.value = match
  showDialog.value = true
}

async function submitPrediction(homeScore: number, awayScore: number) {
  if (!selectedMatch.value) return
  try {
    await predictionsStore.makePrediction(selectedMatch.value.id, homeScore, awayScore)
  } catch (e: any) {
    // If prediction exists, update it
    if (e.statusCode === 409) {
      await predictionsStore.updatePrediction(selectedMatch.value.id, homeScore, awayScore)
    }
  }
}

const groupMatches = computed(() => worldcup.getMatchesByType('group'))
const r32Matches = computed(() => worldcup.getMatchesByType('r32'))
const r16Matches = computed(() => worldcup.getMatchesByType('r16'))
const qfMatches = computed(() => worldcup.getMatchesByType('qf'))
const sfMatches = computed(() => worldcup.getMatchesByType('sf'))
const finalMatch = computed(() => worldcup.getMatchesByType('final')[0])
const thirdMatch = computed(() => worldcup.getMatchesByType('third')[0])
</script>

<template>
  <div class="min-h-screen p-4 md:p-8">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-4xl md:text-5xl font-bold gradient-text mb-2">Predicciones Mundial 2026</h1>
        <p class="text-white/60">Hacé tus predicciones y competí por el primer lugar</p>
      </div>

      <!-- Loading -->
      <div v-if="worldcup.loading" class="text-center py-20">
        <div class="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-white/60">Cargando datos del mundial...</p>
      </div>

      <template v-else>
        <!-- Group Stage -->
        <section class="mb-10">
          <h2 class="text-2xl font-bold mb-4">Fase de Grupos</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <MatchCard v-for="match in groupMatches" :key="match.id" :match="match"
              :prediction="predictionsStore.getPrediction(match.id)" @predict="openPrediction" />
          </div>
        </section>

        <!-- Knockout -->
        <section class="mb-10">
          <h2 class="text-2xl font-bold mb-4">Eliminatorias</h2>

          <div v-if="r32Matches.length" class="mb-6">
            <h3 class="text-lg font-semibold mb-3 text-white/70">Ronda de 32</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MatchCard v-for="match in r32Matches" :key="match.id" :match="match"
                :prediction="predictionsStore.getPrediction(match.id)" @predict="openPrediction" />
            </div>
          </div>

          <div v-if="r16Matches.length" class="mb-6">
            <h3 class="text-lg font-semibold mb-3 text-white/70">Octavos</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MatchCard v-for="match in r16Matches" :key="match.id" :match="match"
                :prediction="predictionsStore.getPrediction(match.id)" @predict="openPrediction" />
            </div>
          </div>

          <div v-if="qfMatches.length" class="mb-6">
            <h3 class="text-lg font-semibold mb-3 text-white/70">Cuartos</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <MatchCard v-for="match in qfMatches" :key="match.id" :match="match"
                :prediction="predictionsStore.getPrediction(match.id)" @predict="openPrediction" />
            </div>
          </div>

          <div v-if="sfMatches.length" class="mb-6">
            <h3 class="text-lg font-semibold mb-3 text-white/70">Semifinales</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <MatchCard v-for="match in sfMatches" :key="match.id" :match="match"
                :prediction="predictionsStore.getPrediction(match.id)" @predict="openPrediction" />
            </div>
          </div>

          <div v-if="finalMatch" class="mb-6">
            <h3 class="text-lg font-semibold mb-3 text-white/70">Final</h3>
            <div class="max-w-md mx-auto">
              <MatchCard :match="finalMatch" :prediction="predictionsStore.getPrediction(finalMatch.id)" @predict="openPrediction" />
            </div>
          </div>

          <div v-if="thirdMatch" class="mb-6">
            <h3 class="text-lg font-semibold mb-3 text-white/70">Tercer Puesto</h3>
            <div class="max-w-md mx-auto">
              <MatchCard :match="thirdMatch" :prediction="predictionsStore.getPrediction(thirdMatch.id)" @predict="openPrediction" />
            </div>
          </div>
        </section>
      </template>

      <!-- Prediction Dialog -->
      <PredictionDialog v-model:open="showDialog" :match="selectedMatch" @submit="submitPrediction" />
    </div>
  </div>
</template>
```

- [ ] **Step 4: Test predictions flow**

Navigate to /predictions, make a prediction, verify it saves.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: match cards, prediction dialog, and predictions page"
```

---

### Task 7: Leaderboard API & Page

**Covers:** [S7 F4]

**Files:**
- Create: `server/api/leaderboard/index.get.ts`
- Create: `app/components/leaderboard/LeaderboardTable.vue`
- Create: `app/pages/leaderboard/index.vue`

**Interfaces:**
- Consumes: `useDb()`, predictions, users
- Produces: Leaderboard API, leaderboard page

- [ ] **Step 1: Create server/api/leaderboard/index.get.ts**

```typescript
import { useDb, users, predictions, eq, desc, count } from '~/server/db'

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
```

- [ ] **Step 2: Create app/components/leaderboard/LeaderboardTable.vue**

```vue
<script setup lang="ts">
defineProps<{
  users: Array<{
    rank: number
    id: number
    username: string
    fullName: string
    avatar: string
    totalPoints: number
    accuracy: number
  }>
  currentUserId?: number
}>()

function medalIcon(rank: number) {
  if (rank === 1) return '🥇'
  if (rank === 2) return '🥈'
  if (rank === 3) return '🥉'
  return rank.toString()
}
</script>

<template>
  <div class="glass-card">
    <div class="space-y-3">
      <div v-for="player in users" :key="player.id"
        class="flex items-center gap-4 p-4 rounded-xl transition-all duration-300 hover:bg-white/5"
        :class="{
          'bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border border-yellow-500/50': player.rank === 1,
          'bg-gradient-to-r from-gray-400/20 to-gray-500/20 border border-gray-400/50': player.rank === 2,
          'bg-gradient-to-r from-orange-600/20 to-orange-700/20 border border-orange-600/50': player.rank === 3,
          'ring-2 ring-primary/50': player.id === currentUserId
        }">

        <!-- Rank -->
        <div class="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 font-bold">
          {{ medalIcon(player.rank) }}
        </div>

        <!-- Avatar -->
        <div class="flex-shrink-0">
          <div class="w-10 h-10 rounded-full overflow-hidden border-2 border-white/20 bg-white/10 flex items-center justify-center">
            <span class="text-lg">{{ player.username[0].toUpperCase() }}</span>
          </div>
        </div>

        <!-- Info -->
        <div class="flex-1 min-w-0">
          <div class="font-bold truncate">{{ player.fullName }}</div>
          <div class="text-sm text-white/50">@{{ player.username }}</div>
        </div>

        <!-- Points -->
        <div class="text-right">
          <div class="text-xl font-bold text-primary">{{ player.totalPoints }}</div>
          <div class="text-xs text-white/50">pts</div>
        </div>
      </div>
    </div>
  </div>
</template>
```

- [ ] **Step 3: Create app/pages/leaderboard/index.vue**

```vue
<script setup lang="ts">
const { user } = useAuth()

const { data } = await useFetch('/api/leaderboard')
const leaderboard = computed(() => (data.value as any)?.leaderboard || [])
</script>

<template>
  <div class="min-h-screen p-4 md:p-8">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-4xl font-bold gradient-text mb-2">Clasificación</h1>
      <p class="text-white/60 mb-8">Los mejores predictores del Mundial 2026</p>

      <LeaderboardTable :users="leaderboard" :current-user-id="user?.id" />
    </div>
  </div>
</template>
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: leaderboard API and ranking page"
```

---

### Task 8: Statistics Page with Charts

**Covers:** [S7 F5]

**Files:**
- Create: `server/api/stats/index.get.ts`
- Create: `app/components/stats/Charts.vue`
- Create: `app/components/stats/AccuracyTable.vue`
- Create: `app/pages/stats/index.vue`

**Interfaces:**
- Consumes: predictions store, Chart.js
- Produces: Stats page with charts and accuracy table

- [ ] **Step 1: Create server/api/stats/index.get.ts**

```typescript
import { useDb, predictions, eq, count } from '~/server/db'
import { jwtVerify } from 'jose'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const token = getCookie(event, 'auth-token')

  if (!token) {
    throw createError({ statusCode: 401, message: 'No autenticado' })
  }

  const secret = new TextEncoder().encode(config.jwtSecret)
  const { payload } = await jwtVerify(token, secret)
  const db = useDb()

  const userPredictions = await db.query.predictions.findMany({
    where: eq(predictions.userId, payload.userId as number)
  })

  const exact = userPredictions.filter(p => p.isExact).length
  const resultOnly = userPredictions.filter(p => p.isResult && !p.isExact).length
  const wrong = userPredictions.filter(p => !p.isResult).length
  const total = userPredictions.length
  const accuracy = total > 0 ? Math.round(((exact + resultOnly) / total) * 100) : 0
  const totalPoints = userPredictions.reduce((sum, p) => sum + (p.points || 0), 0)

  return {
    exact,
    resultOnly,
    wrong,
    total,
    accuracy,
    totalPoints,
    predictions: userPredictions
  }
})
```

- [ ] **Step 2: Create app/components/stats/Charts.vue**

```vue
<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

const props = defineProps<{
  stats: { exact: number; resultOnly: number; wrong: number }
}>()

const accuracyChart = ref<HTMLCanvasElement>()
const distributionChart = ref<HTMLCanvasElement>()
let charts: Chart[] = []

function createCharts() {
  charts.forEach(c => c.destroy())
  charts = []

  if (accuracyChart.value) {
    charts.push(new Chart(accuracyChart.value, {
      type: 'doughnut',
      data: {
        labels: ['Exactas', 'Resultado', 'Incorrectas'],
        datasets: [{
          data: [props.stats.exact, props.stats.resultOnly, props.stats.wrong],
          backgroundColor: ['#10b981', '#fbbf24', '#ef4444'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom', labels: { color: 'rgba(255,255,255,0.8)', padding: 15 } }
        }
      }
    }))
  }
}

onMounted(createCharts)
watch(() => props.stats, createCharts, { deep: true })
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div class="glass-card">
      <h3 class="text-lg font-bold mb-4">Precisión de Predicciones</h3>
      <canvas ref="accuracyChart"></canvas>
    </div>
    <div class="glass-card">
      <h3 class="text-lg font-bold mb-4">Resumen</h3>
      <div class="space-y-4">
        <div class="flex justify-between items-center">
          <span class="text-white/60">Exactas</span>
          <span class="text-green-400 font-bold">{{ stats.exact }}</span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-white/60">Resultado correcto</span>
          <span class="text-yellow-400 font-bold">{{ stats.resultOnly }}</span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-white/60">Incorrectas</span>
          <span class="text-red-400 font-bold">{{ stats.wrong }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
```

- [ ] **Step 3: Create app/pages/stats/index.vue**

```vue
<script setup lang="ts">
const { data } = await useFetch('/api/stats')
const stats = computed(() => (data.value as any) || { exact: 0, resultOnly: 0, wrong: 0, total: 0, accuracy: 0, totalPoints: 0 })
</script>

<template>
  <div class="min-h-screen p-4 md:p-8">
    <div class="max-w-6xl mx-auto">
      <h1 class="text-4xl font-bold gradient-text mb-2">Mis Estadísticas</h1>
      <p class="text-white/60 mb-8">Tu rendimiento en el Mundial 2026</p>

      <!-- Quick stats -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div class="glass-card text-center">
          <div class="text-3xl font-bold text-primary">{{ stats.totalPoints }}</div>
          <div class="text-sm text-white/50">Puntos</div>
        </div>
        <div class="glass-card text-center">
          <div class="text-3xl font-bold text-green-400">{{ stats.accuracy }}%</div>
          <div class="text-sm text-white/50">Precisión</div>
        </div>
        <div class="glass-card text-center">
          <div class="text-3xl font-bold text-blue-400">{{ stats.total }}</div>
          <div class="text-sm text-white/50">Predicciones</div>
        </div>
        <div class="glass-card text-center">
          <div class="text-3xl font-bold text-purple-400">{{ stats.exact }}</div>
          <div class="text-sm text-white/50">Exactas</div>
        </div>
      </div>

      <Charts :stats="stats" />
    </div>
  </div>
</template>
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: statistics page with charts and accuracy table"
```

---

### Task 9: Landing Page & Layout

**Covers:** [S5, S7 F10, S8]

**Files:**
- Modify: `app/app.vue`
- Create: `app/layouts/default.vue`
- Create: `app/pages/index.vue`
- Create: `app/components/AppLogo.vue`

**Interfaces:**
- Consumes: worldcup store, leaderboard API
- Produces: Landing page, default layout with nav

- [ ] **Step 1: Create app/layouts/default.vue**

```vue
<script setup lang="ts">
const { user, isAuthenticated, logout } = useAuth()
const worldcup = useWorldCupStore()

onMounted(() => {
  worldcup.fetchAll()
})
</script>

<template>
  <div class="min-h-screen bg-[#0f172a]">
    <nav class="glass border-b border-white/10 sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <NuxtLink to="/" class="flex items-center gap-2">
          <span class="text-2xl">🏆</span>
          <span class="font-bold gradient-text hidden sm:inline">World Cup 2026</span>
        </NuxtLink>

        <div class="flex items-center gap-4">
          <NuxtLink to="/predictions" class="text-sm text-white/70 hover:text-white transition-colors">Predicciones</NuxtLink>
          <NuxtLink to="/leaderboard" class="text-sm text-white/70 hover:text-white transition-colors">Ranking</NuxtLink>
          <NuxtLink v-if="isAuthenticated" to="/stats" class="text-sm text-white/70 hover:text-white transition-colors">Stats</NuxtLink>

          <template v-if="isAuthenticated">
            <NuxtLink to="/profile" class="text-sm text-white/70 hover:text-white transition-colors">
              {{ user?.username }}
            </NuxtLink>
            <button @click="logout" class="text-sm text-white/50 hover:text-white transition-colors">Salir</button>
          </template>
          <template v-else>
            <NuxtLink to="/login" class="text-sm text-primary hover:text-primary-dark transition-colors">Iniciar Sesión</NuxtLink>
          </template>
        </div>
      </div>
    </nav>

    <main>
      <slot />
    </main>
  </div>
</template>
```

- [ ] **Step 2: Create app/pages/index.vue**

```vue
<script setup lang="ts">
const worldcup = useWorldCupStore()

onMounted(() => {
  if (!worldcup.teams.length) worldcup.fetchAll()
})

const totalMatches = computed(() => worldcup.matches.length)
const finishedMatches = computed(() => worldcup.getFinishedMatches().length)
</script>

<template>
  <div>
    <!-- Hero -->
    <section class="relative py-20 px-4 overflow-hidden">
      <div class="absolute inset-0 overflow-hidden">
        <div class="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
        <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/20 rounded-full blur-3xl animate-pulse" style="animation-delay: 1s"></div>
      </div>

      <div class="max-w-6xl mx-auto text-center relative z-10">
        <div class="mb-8 animate-float">
          <div class="inline-block p-6 rounded-full glass animate-glow">
            <span class="text-6xl">🏆</span>
          </div>
        </div>

        <h1 class="text-5xl md:text-7xl font-bold mb-6">
          <span class="gradient-text">FIFA World Cup</span>
          <br />
          <span class="text-white">2026</span>
        </h1>

        <p class="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
          Predice los resultados, competí con amigos y ganá premios increíbles.
          ¡Demostrá que sos el mejor experto en fútbol!
        </p>

        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <NuxtLink to="/register" class="px-8 py-3 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-dark font-bold text-lg transition-all hover:scale-105 hover:shadow-lg hover:shadow-primary/50 active:scale-95 text-center">
            Unirse Ahora
          </NuxtLink>
          <NuxtLink to="/predictions" class="px-8 py-3 rounded-xl glass text-white font-semibold text-lg transition-all hover:bg-white/10 active:scale-95 text-center">
            Ver Partidos
          </NuxtLink>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-3 gap-6 mt-16 max-w-3xl mx-auto">
          <div class="glass-card text-center">
            <div class="text-3xl font-bold gradient-text">{{ totalMatches }}</div>
            <div class="text-sm text-white/50">Partidos</div>
          </div>
          <div class="glass-card text-center">
            <div class="text-3xl font-bold gradient-text">48</div>
            <div class="text-sm text-white/50">Equipos</div>
          </div>
          <div class="glass-card text-center">
            <div class="text-3xl font-bold gradient-text">16</div>
            <div class="text-sm text-white/50">Estadios</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section class="py-20 px-4">
      <div class="max-w-6xl mx-auto">
        <h2 class="text-4xl font-bold text-center mb-12 gradient-text">Características</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="glass-card transition-all duration-300 hover:scale-105">
            <div class="text-4xl mb-4">📊</div>
            <h3 class="text-xl font-bold mb-2">Estadísticas Detalladas</h3>
            <p class="text-white/60">Analizá tu rendimiento con gráficos interactivos y métricas avanzadas.</p>
          </div>
          <div class="glass-card transition-all duration-300 hover:scale-105">
            <div class="text-4xl mb-4">🔔</div>
            <h3 class="text-xl font-bold mb-2">Notificaciones Push</h3>
            <p class="text-white/60">Recibí alertas en tiempo real sobre partidos y resultados.</p>
          </div>
          <div class="glass-card transition-all duration-300 hover:scale-105">
            <div class="text-4xl mb-4">🏅</div>
            <h3 class="text-xl font-bold mb-2">Logros y Badges</h3>
            <p class="text-white/60">Desbloqueá insignias especiales con tus predicciones.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="py-20 px-4">
      <div class="max-w-4xl mx-auto text-center glass-card">
        <h2 class="text-4xl font-bold mb-4 gradient-text">¿Listo para empezar?</h2>
        <p class="text-white/80 mb-8">Unite a miles de fanáticos y demostrá tu conocimiento del fútbol</p>
        <NuxtLink to="/register" class="px-8 py-3 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-dark font-bold text-lg transition-all hover:scale-105 hover:shadow-lg hover:shadow-primary/50 active:scale-95 inline-block">
          Crear Cuenta Gratis
        </NuxtLink>
      </div>
    </section>
  </div>
</template>
```

- [ ] **Step 3: Update app/app.vue**

```vue
<script setup>
useHead({
  title: 'World Cup 2026 - Predicciones',
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { name: 'description', content: 'Predice los resultados del Mundial FIFA 2026 y ganá premios' },
    { name: 'theme-color', content: '#0f172a' }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' }
  ],
  htmlAttrs: { lang: 'es' }
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: landing page with hero, features, and default layout with nav"
```

---

### Task 10: Group Tables & Badges

**Covers:** [S7 F7, F8]

**Files:**
- Create: `app/components/matches/GroupTable.vue`
- Create: `app/components/achievements/Badges.vue`
- Create: `server/api/achievements/index.get.ts`
- Create: `app/pages/profile/index.vue`

**Interfaces:**
- Consumes: worldcup store, predictions
- Produces: Group tables, achievements system, profile page

- [ ] **Step 1: Create app/components/matches/GroupTable.vue**

```vue
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
```

- [ ] **Step 2: Create server/api/achievements/index.get.ts**

```typescript
import { useDb, achievements, predictions, eq, count } from '~/server/db'
import { jwtVerify } from 'jose'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const token = getCookie(event, 'auth-token')

  if (!token) {
    throw createError({ statusCode: 401, message: 'No autenticado' })
  }

  const secret = new TextEncoder().encode(config.jwtSecret)
  const { payload } = await jwtVerify(token, secret)
  const db = useDb()

  const userAchievements = await db.query.achievements.findMany({
    where: eq(achievements.userId, payload.userId as number)
  })

  const userPredictions = await db.query.predictions.findMany({
    where: eq(predictions.userId, payload.userId as number)
  })

  const exactCount = userPredictions.filter(p => p.isExact).length
  const totalPoints = userPredictions.reduce((sum, p) => sum + (p.points || 0), 0)

  const badges = [
    { id: 'first_prediction', name: 'Primera Predicción', icon: '🎯', description: 'Hacé tu primera predicción', unlocked: userPredictions.length >= 1 },
    { id: 'streak_5', name: 'Racha de 5', icon: '🔥', description: 'Acierta 5 predicciones seguidas', unlocked: exactCount >= 5 },
    { id: 'prophet', name: 'Profeta', icon: '💎', description: '10 predicciones exactas', unlocked: exactCount >= 10 },
    { id: 'consistent', name: 'Consistente', icon: '🌟', description: '70%+ de precisión', unlocked: false },
    { id: 'millionaire', name: 'Millonario', icon: '💰', description: 'Acumulá 1000 puntos', unlocked: totalPoints >= 1000 },
  ]

  return { badges, userAchievements: userAchievements.map(a => a.badgeType) }
})
```

- [ ] **Step 3: Create app/components/achievements/Badges.vue**

```vue
<script setup lang="ts">
defineProps<{
  badges: Array<{
    id: string
    name: string
    icon: string
    description: string
    unlocked: boolean
  }>
}>()
</script>

<template>
  <div class="glass-card">
    <h2 class="text-2xl font-bold gradient-text mb-6">Logros y Badges</h2>
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      <div v-for="badge in badges" :key="badge.id"
        class="relative p-4 rounded-xl text-center transition-all duration-300 hover:scale-105"
        :class="badge.unlocked ? 'bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/50' : 'bg-white/5 opacity-50'">
        <div class="text-3xl mb-2">{{ badge.icon }}</div>
        <h3 class="font-bold text-sm mb-1">{{ badge.name }}</h3>
        <p class="text-xs text-white/50">{{ badge.description }}</p>
        <div v-if="badge.unlocked" class="absolute -top-2 -right-2">
          <div class="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
            <span class="text-white text-xs">✓</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
```

- [ ] **Step 4: Create app/pages/profile/index.vue**

```vue
<script setup lang="ts">
const { user } = useAuth()

const { data: achievementsData } = await useFetch('/api/achievements')
const badges = computed(() => (achievementsData.value as any)?.badges || [])
</script>

<template>
  <div class="min-h-screen p-4 md:p-8">
    <div class="max-w-4xl mx-auto">
      <!-- Profile header -->
      <div class="glass-card mb-8">
        <div class="flex items-center gap-6">
          <div class="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center text-3xl font-bold border-2 border-primary/50">
            {{ user?.username?.[0]?.toUpperCase() || '?' }}
          </div>
          <div>
            <h1 class="text-2xl font-bold">{{ user?.fullName }}</h1>
            <p class="text-white/50">@{{ user?.username }}</p>
            <p class="text-sm text-white/40">{{ user?.email }}</p>
          </div>
        </div>

        <div class="grid grid-cols-3 gap-4 mt-6">
          <div class="text-center">
            <div class="text-2xl font-bold text-primary">{{ user?.totalPoints || 0 }}</div>
            <div class="text-xs text-white/50">Puntos</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-green-400">{{ user?.accuracy || 0 }}%</div>
            <div class="text-xs text-white/50">Precisión</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-blue-400">#{{ user?.rank || '-' }}</div>
            <div class="text-xs text-white/50">Ranking</div>
          </div>
        </div>
      </div>

      <Badges :badges="badges" />
    </div>
  </div>
</template>
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: group tables, achievements/badges, and profile page"
```

---

### Task 11: App Logo & Final Polish

**Covers:** [S8]

**Files:**
- Create: `app/components/AppLogo.vue`
- Modify: Various components for consistency

**Interfaces:**
- Produces: Branded logo component, consistent UI

- [ ] **Step 1: Create app/components/AppLogo.vue**

```vue
<template>
  <div class="flex items-center gap-2">
    <span class="text-2xl">🏆</span>
    <span class="font-bold gradient-text">WC2026</span>
  </div>
</template>
```

- [ ] **Step 2: Add .compose to .gitignore**

```bash
echo ".compose/" >> .gitignore
```

- [ ] **Step 3: Final verification**

```bash
pnpm dev
```

Test all pages: /, /login, /register, /predictions, /leaderboard, /stats, /profile.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: app logo, gitignore update, and final polish"
```

---

### Task 12: Railway Deployment Config

**Covers:** [S10]

**Files:**
- Create: `Dockerfile`
- Create: `railway.json`

**Interfaces:**
- Produces: Deployable Docker container for Railway

- [ ] **Step 1: Create Dockerfile**

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile

COPY . .

RUN pnpm drizzle-kit push
RUN pnpm build

EXPOSE 3000

RUN mkdir -p /app/data

CMD ["node", ".output/server/index.mjs"]
```

- [ ] **Step 2: Create railway.json**

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "Dockerfile"
  },
  "deploy": {
    "startCommand": "node .output/server/index.mjs",
    "healthcheckPath": "/api/health",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

- [ ] **Step 3: Create server/api/health.get.ts**

```typescript
export default defineEventHandler(() => {
  return {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  }
})
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: Railway deployment config with Dockerfile"
```
