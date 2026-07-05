# World Cup 2026 Predictions App — Design Spec

## [S1] Problem

Build a full-featured World Cup 2026 predictions app where users register, predict match results, compete on a leaderboard, and win prizes. The app needs real-time data from the free worldcup26.ir API, animated bracket visualization, push notifications, statistics with charts, and a modern glassmorphism UI.

## [S2] Stack

| Layer | Technology |
|-------|-----------|
| Framework | Nuxt 4 |
| UI Components | @nuxt/ui v4 |
| Styling | Tailwind CSS v4 (via Nuxt UI) |
| Database | SQLite via better-sqlite3 |
| ORM | Drizzle ORM |
| Auth | @sidebase/nuxt-auth (JWT) |
| State | Pinia |
| Charts | Chart.js + vue-chartjs |
| Confetti | canvas-confetti |
| Dates | date-fns |
| Data API | worldcup26.ir (free, no key) |
| Deploy | Railway |

## [S3] Database Schema

### users
| Column | Type | Notes |
|--------|------|-------|
| id | integer PK | auto-increment |
| username | text | unique, not null |
| email | text | unique, not null |
| password_hash | text | bcrypt |
| full_name | text | not null |
| avatar | text | default '/avatars/default.png' |
| total_points | integer | default 0 |
| accuracy | real | default 0 |
| rank | integer | default 0 |
| push_subscription | text | JSON string |
| created_at | text | default CURRENT_TIMESTAMP |

### predictions
| Column | Type | Notes |
|--------|------|-------|
| id | integer PK | auto-increment |
| user_id | integer FK→users | not null |
| match_id | text | not null (API match id) |
| home_score | integer | not null |
| away_score | integer | not null |
| points | integer | default 0 |
| is_exact | integer | boolean, default 0 |
| is_result | integer | boolean, default 0 |
| created_at | text | default CURRENT_TIMESTAMP |

### notifications
| Column | Type | Notes |
|--------|------|-------|
| id | integer PK | auto-increment |
| user_id | integer FK→users | nullable (null = broadcast) |
| title | text | not null |
| message | text | not null |
| type | text | match_reminder, result, ranking |
| read | integer | boolean, default 0 |
| match_id | text | nullable |
| created_at | text | default CURRENT_TIMESTAMP |

### achievements
| Column | Type | Notes |
|--------|------|-------|
| id | integer PK | auto-increment |
| user_id | integer FK→users | not null |
| badge_type | text | not null |
| unlocked_at | text | default CURRENT_TIMESTAMP |

## [S4] External API Integration

Source: `https://worldcup26.ir`

### Endpoints Used
- `GET /get/teams` — 48 teams with flag, fifa_code, group
- `GET /get/groups` — 12 groups (A-L) with standings
- `GET /get/games` — 104 matches with scores, status, scorers
- `GET /get/stadiums` — 16 stadiums with capacity, city

### Data Model (from API)
```typescript
interface Team {
  _id: string
  id: string
  name_en: string
  fifa_code: string
  flag: string       // URL to flag image
  groups: string     // A-L
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
  local_date: string  // "MM/DD/YYYY HH:mm"
  stadium_id: string
  finished: string    // "TRUE" | "FALSE"
  time_elapsed: string // "notstarted" | "finished" | minutes
  type: string        // "group" | "r32" | "r16" | "qf" | "sf" | "final" | "third"
  home_team_name_en: string
  away_team_name_en: string
}
```

### Caching Strategy
- Fetch teams/groups/stadiums on app init, cache in Pinia store
- Fetch matches every 30 seconds during live matches
- Cache match data for 5 minutes when no live matches

## [S5] Pages & Routes

| Route | Page | Auth | Description |
|-------|------|------|-------------|
| `/` | Landing | No | Hero, features, top players, CTA |
| `/login` | Login | No | Email + password login |
| `/register` | Register | No | Full registration form |
| `/predictions` | Predictions | Yes | All matches, bracket, make predictions |
| `/predictions/[id]` | Match Detail | Yes | Single match + prediction form |
| `/leaderboard` | Leaderboard | No | Global ranking table |
| `/stats` | Statistics | Yes | Personal stats with charts |
| `/profile` | Profile | Yes | User info, badges, history |
| `/admin` | Admin Dashboard | Admin | Manage matches, results |

## [S6] Scoring System

| Prediction | Points |
|-----------|--------|
| Exact score (e.g. 2-1 predicted, 2-1 actual) | 3 |
| Correct result (win/draw/loss correct, score wrong) | 1 |
| Wrong | 0 |

### Streak Bonus
- 3+ correct predictions in a row: +1 bonus point per prediction
- Resets on wrong prediction

## [S7] Features

### F1: Authentication
- Register with username, email, password, full_name
- Login with email + password
- JWT stored in httpOnly cookie
- Session managed by @sidebase/nuxt-auth
- Logout clears session

### F2: Match Predictions
- View all 104 matches grouped by phase
- Make prediction before match starts (deadline: match start time)
- Edit prediction before deadline
- Quick score buttons (1-0, 2-1, 1-1, etc.)
- Points calculated automatically when match finishes

### F3: Bracket Visualization
- SVG-based bracket for knockout phase (r32→r16→qf→sf→final)
- Animated connections between rounds
- Losers tachados (line-through, opacity reduced)
- Confetti celebration when champion crowned
- Team flags and scores inline

### F4: Leaderboard
- Global ranking by total points
- Secondary sort by accuracy
- Top 3 with medal icons (gold/silver/bronze)
- User's own position highlighted
- Filterable by phase

### F5: Statistics & Charts
- Accuracy doughnut (exact/result/wrong)
- Points by phase (bar chart)
- Prediction distribution (pie chart)
- Streak over time (line chart)
- Heat map of predicted teams

### F6: Notifications
- Push notifications via Web Push API
- Reminders: 2h, 1h, 30min before match
- Result notification with confetti for winners
- In-app notification bell with unread count
- Notification history page

### F7: Group Tables
- 12 groups (A-L) with live standings
- Points, wins, draws, losses, GF, GA, GD
- Team flags inline
- Auto-update from API

### F8: Achievements/Badges
8 unlockable badges:
1. Primera Predicción — make first prediction
2. Racha de 5 — 5 correct in a row
3. Profeta — 10 exact predictions
4. Campeón — rank #1
5. Velocista — 10 predictions in 1 hour
6. Consistente — 70%+ accuracy
7. Social — share 5 predictions
8. Millonario — 1000+ total points

### F9: Admin Panel
- Dashboard with total users, predictions, active matches
- Update match results manually
- Manage users
- View all predictions

### F10: PWA
- Service worker for offline caching
- Web app manifest
- Installable on mobile
- Push notification support

## [S8] UI/UX Design

### Visual Style
- Dark mode by default (#0f172a background)
- Glassmorphism cards (bg-white/5, backdrop-blur-lg, border-white/10)
- Gradient text (primary gold → secondary blue → accent purple)
- Custom scrollbar (gold thumb)
- Smooth page transitions

### Animations
- Float animation on trophy/hero elements
- Pulse glow on live match indicators
- Card hover scale + shadow
- Progress bar animations
- Confetti on correct predictions and champion crown
- Page enter/leave transitions

### Color Palette
- Primary: #fbbf24 (gold)
- Secondary: #3b82f6 (blue)
- Accent: #8b5cf6 (purple)
- Success: #10b981 (green)
- Error: #ef4444 (red)
- Dark: #0f172a

## [S9] File Structure

```
mundial-2026/
├── app/
│   ├── app.vue
│   ├── app.config.ts
│   ├── assets/css/main.css
│   ├── components/
│   │   ├── AppLogo.vue
│   │   ├── matches/
│   │   │   ├── MatchCard.vue
│   │   │   ├── MatchBracketCard.vue
│   │   │   ├── LiveBracket.vue
│   │   │   ├── PredictionDialog.vue
│   │   │   └── GroupTable.vue
│   │   ├── leaderboard/
│   │   │   ├── LeaderboardTable.vue
│   │   │   └── TopPlayers.vue
│   │   ├── stats/
│   │   │   ├── Charts.vue
│   │   │   ├── AccuracyTable.vue
│   │   │   └── UserStats.vue
│   │   ├── notifications/
│   │   │   └── NotificationBell.vue
│   │   └── achievements/
│   │       └── Badges.vue
│   ├── composables/
│   │   ├── useWorldCupData.ts
│   │   ├── useMatchUpdates.ts
│   │   └── useNotifications.ts
│   ├── pages/
│   │   ├── index.vue
│   │   ├── login.vue
│   │   ├── register.vue
│   │   ├── predictions/
│   │   │   ├── index.vue
│   │   │   └── [id].vue
│   │   ├── leaderboard/
│   │   │   └── index.vue
│   │   ├── stats/
│   │   │   └── index.vue
│   │   ├── profile/
│   │   │   └── index.vue
│   │   └── admin/
│   │       ├── index.vue
│   │       └── matches.vue
│   └── stores/
│       ├── auth.ts
│       ├── worldcup.ts
│       └── predictions.ts
├── server/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login.post.ts
│   │   │   ├── register.post.ts
│   │   │   └── logout.post.ts
│   │   ├── predictions/
│   │   │   ├── index.get.ts
│   │   │   ├── index.post.ts
│   │   │   └── [id].put.ts
│   │   ├── leaderboard/
│   │   │   └── index.get.ts
│   │   ├── stats/
│   │   │   └── index.get.ts
│   │   ├── notifications/
│   │   │   ├── index.get.ts
│   │   │   ├── subscribe.post.ts
│   │   │   └── send.post.ts
│   │   ├── achievements/
│   │   │   └── index.get.ts
│   │   ├── worldcup/
│   │   │   ├── teams.get.ts
│   │   │   ├── groups.get.ts
│   │   │   ├── matches.get.ts
│   │   │   └── stadiums.get.ts
│   │   └── health.get.ts
│   ├── db/
│   │   ├── index.ts
│   │   ├── schema.ts
│   │   └── migrations/
│   ├── middleware/
│   │   └── auth.ts
│   └── utils/
│       ├── scoring.ts
│       └── notifications.ts
├── public/
│   ├── manifest.json
│   └── sw.js
├── nuxt.config.ts
├── drizzle.config.ts
├── package.json
├── Dockerfile
├── railway.json
└── .env
```

## [S10] Deployment

### Railway
- Dockerfile based on node:20-alpine
- SQLite data in /app/data/ with persistent volume
- Health check at /api/health
- Environment variables: JWT_SECRET, VAPID keys

### Environment Variables
```
DATABASE_URL=./data/worldcup.db
JWT_SECRET=<generated>
NUXT_AUTH_SECRET=<generated>
VAPID_PUBLIC_KEY=<generated>
VAPID_PRIVATE_KEY=<generated>
```
