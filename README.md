# Mundial 2026

<div align="center">

![Nuxt](https://img.shields.io/badge/Nuxt_4-00DC82?logo=nuxt&logoColor=white)
![Vue](https://img.shields.io/badge/Vue_3.5-4FC08D?logo=vue.js&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-003B57?logo=sqlite&logoColor=white)
![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-7B8FE6?logo=drizzle&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_4-06B6D4?logo=tailwindcss&logoColor=white)
![Nuxt UI](https://img.shields.io/badge/Nuxt_UI_v4-00DC82?logo=nuxt&logoColor=white)
![Railway](https://img.shields.io/badge/Railway-0B0D0E?logo=railway&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-green)

**Aplicacion de predicciones para el Mundial FIFA 2026** — registra resultados, compite con amigos, gana premios.

</div>

---

## Tabla de Contenidos

- [Caracteristicas](#caracteristicas)
- [Stack Tecnologico](#stack-tecnologico)
- [Paginas](#paginas)
- [Sistema de Puntuacion](#sistema-de-puntuacion)
- [API de Datos](#api-de-datos)
- [Modelo de Datos](#modelo-de-datos)
- [Requisitos](#requisitos)
- [Instalacion](#instalacion)
- [Deploy en Railway](#deploy-en-railway)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Roadmap](#roadmap)
- [Licencia](#licencia)

---

## Caracteristicas

### Predicciones
- **104 partidos** del Mundial 2026 — desde fase de grupos hasta la final
- Prediccion de resultados con selector de marcador y botones rapidos
- Edicion de prediccion antes del inicio del partido
- Bracket eliminatorio animado con SVG y conexiones entre rondas
- Calculo automatico de puntos al finalizar cada partido

### Tabla de Posiciones
- **12 grupos** (A-L) con posiciones en vivo
- Datos completos: PJ, G, E, P, GF, GC, DG, Pts
- Clasificados y eliminados resaltados visualmente
- Banderas de las 48 selecciones

### Ranking
- Clasificacion global de jugadores por puntos
- Top 3 con medallas (oro, plata, bronce)
- Posicion del usuario destacada

### Estadisticas
- Grafico de dona con distribucion exactas/resultado/incorrectas
- Grafico de linea con racha de ultimas predicciones
- Barras de progreso de puntos, eficiencia y racha
- Desglose detallado con porcentajes

### Perfil de Usuario
- Avatar con gradiente y badge de ranking
- Estadisticas personales: puntos, precisión, predicciones
- Sistema de logros y badges desbloqueables
- Racha actual y mejor racha

### Panel de Administracion
- Dashboard con metricas globales
- Gestion de usuarios y predicciones
- Acceso restringido a administradores

### Notificaciones Push
- Suscripcion a notificaciones via Web Push API
- Notificaciones de confirmacion de prediccion
- Alertas de resultados

### PWA
- Service worker con cache de assets
- Instalable en dispositivos moviles
- Soporte para notificaciones push offline

---

## Stack Tecnologico

### Frontend
| Tecnologia | Version | Uso |
|------------|---------|-----|
| Nuxt | 4.4.8 | Framework web |
| Vue | 3.5.35 | UI reactiva |
| Nuxt UI | 4.9.0 | Componentes de interfaz |
| Tailwind CSS | 4.3.1 | Estilos utilitarios |
| Pinia | 3.0.4 | Estado global |
| Chart.js | 4.5.1 | Graficos interactivos |
| canvas-confetti | 1.9.4 | Efectos de celebracion |
| date-fns | 4.4.0 | Formateo de fechas |
| TypeScript | 6.0.3 | Tipado estatico |

### Backend
| Tecnologia | Version | Uso |
|------------|---------|-----|
| SQLite | — | Base de datos embebida |
| Drizzle ORM | 0.45.2 | ORM tipado |
| better-sqlite3 | 12.11.1 | Driver SQLite |
| jose | 6.2.3 | JWT para autenticacion |
| bcryptjs | 3.0.3 | Hashing de contraseñas |
| web-push | 3.6.7 | Notificaciones push |

### Infraestructura
| Tecnologia | Uso |
|------------|-----|
| Railway | Hosting y deploy |
| Docker | Contenedor de produccion |
| worldcup26.ir | API de datos del Mundial |

---

## Paginas

| Ruta | Pagina | Auth | Descripcion |
|------|--------|------|-------------|
| `/` | Landing | No | Hero, caracteristicas, CTA |
| `/login` | Iniciar Sesion | No | Login con email + contraseña |
| `/register` | Registro | No | Creacion de cuenta |
| `/partidos` | Ver Partidos | No | Todos los partidos, resultados, proximos encuentros |
| `/partidos` | Detalle Partido | No | Modal con estadisticas, goles, estadio y enlaces |
| `/posiciones` | Posiciones | No | Tabla de grupos A-L con posiciones |
| `/predictions` | Predicciones | Si | Hacer y editar predicciones |
| `/leaderboard` | Ranking | No | Clasificacion global |
| `/stats` | Estadisticas | Si | Graficos y metricas personales |
| `/profile` | Perfil | Si | Informacion del usuario y logros |
| `/admin` | Admin | Admin | Dashboard de administracion |

---

## Sistema de Puntuacion

| Resultado | Puntos |
|-----------|:------:|
| Prediccion exacta (marcador correcto) | **3** |
| Resultado correcto (ganador/empate) | **1** |
| Incorrecto | **0** |

### Rachas
- **3+** aciertos consecutivos: +1 punto bonus por prediccion
- La racha se reinicia al fallar

---

## API de Datos

La aplicacion consume datos en tiempo real de la API gratuita **worldcup26.ir**:

| Endpoint | Datos |
|----------|-------|
| `GET /get/teams` | 48 selecciones con bandera, codigo FIFA, grupo |
| `GET /get/groups` | 12 grupos con posiciones (PJ, G, E, P, GF, GC, DG, Pts) |
| `GET /get/games` | 104 partidos con resultados, goleadores, estado |
| `GET /get/stadiums` | 16 estadios con capacidad, ciudad, pais |

Sin necesidad de API key. Datos en vivo durante el torneo.

---

## Modelo de Datos

### Entidades

```
usuarios (id, username, email, password_hash, full_name, avatar, total_points, accuracy, rank, push_subscription, role, created_at)
    |
    +-- predicciones (id, user_id FK, match_id, home_score, away_score, points, is_exact, is_result, created_at)
    |
    +-- notificaciones (id, user_id FK, title, message, type, read, match_id, created_at)
    |
    +-- logros (id, user_id FK, badge_type, unlocked_at)
```

### Tablas

| Tabla | Descripcion |
|-------|-------------|
| `users` | Usuarios registrados, stats, rol y suscripcion push |
| `predictions` | Predicciones con puntaje y acierto |
| `notifications` | Notificaciones push e in-app |
| `achievements` | Logros y badges desbloqueados |

Los datos de partidos, equipos, grupos y estadios se obtienen de la API externa — no se almacenan en SQLite.

---

## Requisitos

- **Node.js 22+** (https://nodejs.org/)
- **pnpm 11+** (https://pnpm.io/installation)
- **Navegador moderno**: Chrome 90+, Firefox 88+, Edge 90+, Safari 14+

---

## Instalacion

### 1. Clonar el repositorio

```bash
git clone git@github.com:daddydiaz2/Mundial-2026.git
cd Mundial-2026
```

### 2. Instalar dependencias

```bash
pnpm install
```

### 3. Configurar variables de entorno

```bash
cp .env.example .env
# Editar JWT_SECRET y demas variables si es necesario
```

### 4. Inicializar base de datos

```bash
pnpm drizzle-kit push
```

### 5. Ejecutar en desarrollo

```bash
pnpm dev
# Abrir http://localhost:3000
```

---

## Deploy en Railway

### Manual

```bash
# Instalar Railway CLI
npm i -g @railway/cli

# Login
railway login

# Vincular proyecto
railway link

# Configurar variables
railway variables set JWT_SECRET=your-secret-key

# Deploy
railway up
```

### Automatico via Docker

La aplicacion incluye `Dockerfile` y `railway.json` para deploy automatico. Railway detecta el Dockerfile y construye la imagen automaticamente.

---

## Estructura del Proyecto

```
mundial-2026/
├── app/
│   ├── app.vue                    # Layout principal, head, SEO
│   ├── app.config.ts             # Configuracion de la app
│   ├── assets/css/main.css       # Estilos globales, glassmorphism, animaciones
│   ├── components/
│   │   ├── AppLogo.vue           # Logo de la aplicacion
│   │   ├── achievements/
│   │   │   └── Badges.vue        # Grid de logros y badges
│   │   ├── leaderboard/
│   │   │   └── LeaderboardTable.vue  # Tabla de clasificacion
│   │   ├── matches/
│   │   │   ├── GroupTable.vue        # Tabla de grupo
│   │   │   ├── LiveBracket.vue       # Bracket eliminatorio animado
│   │   │   ├── MatchCard.vue         # Tarjeta de partido
│   │   │   ├── MatchDetailDialog.vue # Modal detalle de partido
│   │   │   └── PredictionDialog.vue  # Modal para hacer prediccion
│   │   ├── notifications/
│   │   │   └── NotificationBell.vue  # Campana de notificaciones push
│   │   └── stats/
│   │       └── Charts.vue            # Graficos Chart.js
│   ├── composables/
│   │   ├── useAuth.ts                # Autenticacion JWT
│   │   └── useNotifications.ts       # Push notifications
│   ├── layouts/
│   │   └── default.vue               # Layout con navegacion
│   ├── pages/
│   │   ├── index.vue                 # Landing page
│   │   ├── login.vue                 # Inicio de sesion
│   │   ├── register.vue              # Registro
│   │   ├── partidos/index.vue        # Ver partidos
│   │   ├── posiciones/index.vue      # Tabla de posiciones
│   │   ├── predictions/index.vue     # Hacer predicciones
│   │   ├── leaderboard/index.vue     # Ranking
│   │   ├── stats/index.vue           # Estadisticas
│   │   ├── profile/index.vue         # Perfil de usuario
│   │   └── admin/index.vue           # Panel admin
│   └── stores/
│       ├── predictions.ts            # Store de predicciones
│       └── worldcup.ts               # Store de datos del mundial
├── server/
│   ├── api/
│   │   ├── auth/                     # Login, register, logout, me
│   │   ├── predictions/              # CRUD predicciones
│   │   ├── leaderboard/              # Ranking de usuarios
│   │   ├── stats/                    # Estadisticas del usuario
│   │   ├── notifications/            # Push notifications
│   │   ├── achievements/             # Logros y badges
│   │   ├── admin/                    # Dashboard admin
│   │   ├── worldcup/                 # Proxy a API externa
│   │   └── health.get.ts            # Health check
│   ├── db/
│   │   ├── schema.ts                 # Esquema Drizzle ORM
│   │   └── index.ts                  # Conexion a SQLite
│   └── utils/
│       └── scoring.ts                # Logica de puntuacion
├── public/
│   ├── manifest.json                 # PWA manifest
│   └── sw.js                         # Service worker
├── Dockerfile                        # Docker para Railway
├── railway.json                      # Config Railway
├── drizzle.config.ts                 # Config Drizzle Kit
├── nuxt.config.ts                    # Config Nuxt
└── .env                              # Variables de entorno
```

---

## Roadmap

### Implementado
- [x] Autenticacion JWT con registro, login y logout
- [x] Predicciones con sistema de puntuacion (3/1/0)
- [x] Bracket eliminatorio animado con SVG
- [x] Tabla de posiciones con 12 grupos
- [x] Ranking global con medallas
- [x] Estadisticas con graficos Chart.js
- [x] Perfil de usuario con logros y badges
- [x] Panel de administracion
- [x] Notificaciones push (Web Push API)
- [x] PWA con service worker offline
- [x] Modal de detalle de partido con goles y estadio
- [x] Enlaces a transmisiones para partidos proximos
- [x] Diseño responsive con glassmorphism
- [x] Animaciones y confetti en predicciones
- [x] Deploy en Railway con Docker

### Planificado
- [ ] Sistema de ligas privadas entre amigos
- [ ] Chat en vivo durante los partidos
- [ ] Predicciones especiales (goleador, tarjetas)
- [ ] Comparacion head-to-head entre usuarios
- [ ] Dark mode toggle
- [ ] Multi-idioma (es/en)

---

## Licencia

**MIT** — ver [LICENSE](LICENSE).

---

<div align="center">

Desarrollado con Nuxt 4 + SQLite + Drizzle ORM

**Mundial 2026** — Predicciones FIFA World Cup 2026

</div>
