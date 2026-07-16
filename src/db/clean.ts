import 'dotenv/config';
import { db } from './index';
import { sql } from 'drizzle-orm';
import { categories } from './schema';

async function clean() {
  console.log('🧹 Clearing all user tables and data...');
  
  // Truncate tables, CASCADE automatically drops referencing records in order
  await db.execute(sql`TRUNCATE TABLE transactions, subscriptions, goals, categories CASCADE`);
  
  console.log('✨ Database cleared!');
  
  console.log('🌱 Re-seeding default categories...');
  const defaultCategories = [
    { name: 'Alimentación', type: 'expense' as const, icon: 'utensils', color: '#F59E0B', isDefault: true },
    { name: 'Transporte', type: 'expense' as const, icon: 'car', color: '#3B82F6', isDefault: true },
    { name: 'Vivienda', type: 'expense' as const, icon: 'home', color: '#8B5CF6', isDefault: true },
    { name: 'Ocio', type: 'expense' as const, icon: 'gamepad-2', color: '#EC4899', isDefault: true },
    { name: 'Salud', type: 'expense' as const, icon: 'heart-pulse', color: '#EF4444', isDefault: true },
    { name: 'Educación', type: 'expense' as const, icon: 'book-open', color: '#06B6D4', isDefault: true },
    { name: 'Servicios', type: 'expense' as const, icon: 'zap', color: '#EAB308', isDefault: true },
    { name: 'Otros Gastos', type: 'expense' as const, icon: 'more-horizontal', color: '#6B7280', isDefault: true },
    { name: 'Salario', type: 'income' as const, icon: 'briefcase', color: '#10B981', isDefault: true },
    { name: 'Freelance', type: 'income' as const, icon: 'laptop', color: '#10B981', isDefault: true },
    { name: 'Inversiones', type: 'income' as const, icon: 'trending-up', color: '#10B981', isDefault: true },
    { name: 'Otros Ingresos', type: 'income' as const, icon: 'plus', color: '#10B981', isDefault: true },
  ];
  
  for (const cat of defaultCategories) {
    await db.insert(categories).values(cat);
  }
  
  console.log('✅ Clean and seed completed successfully!');
  process.exit(0);
}

clean().catch((err) => {
  console.error('❌ Clean failed:', err);
  process.exit(1);
});
