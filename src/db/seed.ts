import 'dotenv/config';
import { eq, and } from 'drizzle-orm';
import { db } from './index';
import { categories } from './schema';

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

async function seed() {
  console.log('🌱 Seeding categories...');

  for (const cat of defaultCategories) {
    const existing = await db.select()
      .from(categories)
      .where(and(eq(categories.name, cat.name), eq(categories.type, cat.type)));
    
    if (existing.length === 0) {
      await db.insert(categories).values(cat);
    }
  }

  console.log('✅ Seed completed!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
