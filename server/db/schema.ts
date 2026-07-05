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
