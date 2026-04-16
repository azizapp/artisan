-- ============================================
-- ملف شامل: حذف كل شيء وإعادة إنشاء قاعدة البيانات
-- شغل هذا الكود كاملاً في Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. حذف كل شيء (الدوال، التريجرات، الجداول)
-- ============================================

-- حذف التريجرات
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- حذف الدوال
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.create_new_user(TEXT, TEXT, TEXT, TEXT, BOOLEAN);
DROP FUNCTION IF EXISTS public.create_new_user(TEXT, TEXT, TEXT, BOOLEAN);

-- حذف الجداول (بالترتيب الصحيح بسبب العلاقات)
DROP TABLE IF EXISTS settings CASCADE;
DROP TABLE IF EXISTS expenses CASCADE;
DROP TABLE IF EXISTS contributions CASCADE;
DROP TABLE IF EXISTS artisans CASCADE;
DROP TABLE IF EXISTS trades CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ============================================
-- 2. تفعيل الإضافات
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 3. إنشاء الجداول
-- ============================================

-- جدول المستخدمين
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  password TEXT,
  role TEXT DEFAULT 'writer' CHECK (role IN ('admin', 'writer', 'treasurer', 'secretary', 'consultant')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول المهن
CREATE TABLE trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar TEXT NOT NULL,
  name_fr TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول الحرفيين
CREATE TABLE artisans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  national_id TEXT UNIQUE NOT NULL,
  phone TEXT,
  shop_number TEXT NOT NULL,
  area TEXT NOT NULL,
  employee_count INTEGER DEFAULT 0,
  trade_id UUID REFERENCES trades(id) ON DELETE SET NULL,
  documents JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول الاشتراكات
CREATE TABLE contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artisan_id UUID NOT NULL REFERENCES artisans(id) ON DELETE CASCADE,
  occasion TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  payment_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول المصروفات
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  expense_date DATE NOT NULL,
  notes TEXT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول الإعدادات
CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  theme TEXT DEFAULT 'light',
  language TEXT DEFAULT 'ar',
  font_family TEXT DEFAULT 'system-ui',
  font_size TEXT DEFAULT 'medium',
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- 4. إنشاء الفهارس
-- ============================================
CREATE INDEX idx_artisans_national_id ON artisans(national_id);
CREATE INDEX idx_artisans_trade_id ON artisans(trade_id);
CREATE INDEX idx_artisans_is_active ON artisans(is_active);
CREATE INDEX idx_contributions_artisan_id ON contributions(artisan_id);
CREATE INDEX idx_contributions_payment_date ON contributions(payment_date);
CREATE INDEX idx_expenses_expense_date ON expenses(expense_date);

-- ============================================
-- 5. تفعيل Row Level Security
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE artisans ENABLE ROW LEVEL SECURITY;
ALTER TABLE contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 6. سياسات RLS - جدول المستخدمين
-- ============================================
CREATE POLICY "Users can view all users" ON users
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert users" ON users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (true);

CREATE POLICY "Only admins can delete users" ON users
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- 7. سياسات RLS - جدول المهن
-- ============================================
CREATE POLICY "Anyone can view trades" ON trades
  FOR SELECT USING (true);

CREATE POLICY "Anyone can modify trades" ON trades
  FOR ALL USING (true);

-- ============================================
-- 8. سياسات RLS - جدول الحرفيين
-- ============================================
CREATE POLICY "Anyone can view artisans" ON artisans
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert artisans" ON artisans
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update artisans" ON artisans
  FOR UPDATE USING (true);

CREATE POLICY "Anyone can delete artisans" ON artisans
  FOR DELETE USING (true);

-- ============================================
-- 9. سياسات RLS - جدول الاشتراكات
-- ============================================
CREATE POLICY "Anyone can view contributions" ON contributions
  FOR SELECT USING (true);

CREATE POLICY "Anyone can modify contributions" ON contributions
  FOR ALL USING (true);

-- ============================================
-- 10. سياسات RLS - جدول المصروفات
-- ============================================
CREATE POLICY "Anyone can view expenses" ON expenses
  FOR SELECT USING (true);

CREATE POLICY "Anyone can modify expenses" ON expenses
  FOR ALL USING (true);

-- ============================================
-- 11. سياسات RLS - جدول الإعدادات
-- ============================================
CREATE POLICY "Anyone can view settings" ON settings
  FOR SELECT USING (true);

CREATE POLICY "Anyone can modify settings" ON settings
  FOR ALL USING (true);

-- ============================================
-- 12. دالة إنشاء مستخدم جديد (RPC)
-- ============================================
CREATE OR REPLACE FUNCTION public.create_new_user(
  p_email TEXT,
  p_full_name TEXT,
  p_password TEXT,
  p_role TEXT DEFAULT 'writer',
  p_is_active BOOLEAN DEFAULT true
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  v_user_id := gen_random_uuid();
  
  INSERT INTO public.users (id, email, full_name, password, role, is_active, created_at)
  VALUES (v_user_id, p_email, p_full_name, p_password, p_role, p_is_active, NOW());
  
  RETURN v_user_id;
END;
$$;

-- إعطاء صلاحية التنفيذ
GRANT EXECUTE ON FUNCTION public.create_new_user(TEXT, TEXT, TEXT, TEXT, BOOLEAN) TO anon;
GRANT EXECUTE ON FUNCTION public.create_new_user(TEXT, TEXT, TEXT, TEXT, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_new_user(TEXT, TEXT, TEXT, TEXT, BOOLEAN) TO public;

-- ============================================
-- 13. إدخال البيانات الافتراضية - المهن
-- ============================================
INSERT INTO trades (name_ar, name_fr) VALUES
  ('نجار', 'Menuisier'),
  ('حداد', 'Forgeron'),
  ('سباك', 'Plombier'),
  ('كهربائي', 'Électricien'),
  ('مبلط', 'Carreleur'),
  ('صباغ', 'Peintre'),
  ('ميكانيكي', 'Mécanicien'),
  ('خياط', 'Tailleur'),
  ('حلاق', 'Coiffeur'),
  ('معلم بناء', 'Maçon');

-- ============================================
-- 14. إدخال مستخدم إداري افتراضي
-- ============================================
INSERT INTO users (email, full_name, password, role, is_active)
VALUES ('admin@artisan.com', 'المسؤول', 'admin123', 'admin', true);
