import { pgTable, pgEnum, serial, varchar, integer, boolean, timestamp, date, text } from 'drizzle-orm/pg-core';

export const transactionTypeEnum = pgEnum('transaction_type', ['income', 'expense']);

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  type: transactionTypeEnum('type').notNull(),
  icon: varchar('icon', { length: 50 }),
  color: varchar('color', { length: 7 }),
  monthlyLimit: integer('monthly_limit'),
  isDefault: boolean('is_default').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const transactions = pgTable('transactions', {
  id: serial('id').primaryKey(),
  amount: integer('amount').notNull(),
  type: transactionTypeEnum('type').notNull(),
  categoryId: integer('category_id').notNull().references(() => categories.id),
  note: varchar('note', { length: 500 }),
  date: date('date').notNull().defaultNow(),
  imageUrl: text('image_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const subscriptions = pgTable('subscriptions', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  amount: integer('amount').notNull(),
  type: varchar('type', { length: 50 }).notNull(), // 'recurring' | 'one-time'
  categoryId: integer('category_id').notNull().references(() => categories.id),
  dueDate: date('due_date').notNull(),
  status: varchar('status', { length: 50 }).notNull().default('pending'), // 'pending' | 'paid' | 'cancelled'
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const goals = pgTable('goals', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  targetAmount: integer('target_amount').notNull(),
  currentAmount: integer('current_amount').notNull().default(0),
  dueDate: date('due_date').notNull(),
  savingLocation: varchar('saving_location', { length: 100 }).notNull(), // 'bank_account' | 'pocket' | 'virtual_card' | 'cash' | 'other'
  icon: varchar('icon', { length: 50 }).default('target'),
  color: varchar('color', { length: 7 }).default('#00C795'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

