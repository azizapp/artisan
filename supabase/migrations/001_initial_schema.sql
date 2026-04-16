-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT DEFAULT 'writer' CHECK (role IN ('admin', 'writer', 'treasurer', 'secretary', 'consultant')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trades table
CREATE TABLE IF NOT EXISTS trades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_ar TEXT NOT NULL,
  name_fr TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Artisans table
CREATE TABLE IF NOT EXISTS artisans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- Contributions table
CREATE TABLE IF NOT EXISTS contributions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artisan_id UUID NOT NULL REFERENCES artisans(id) ON DELETE CASCADE,
  occasion TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  payment_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  expense_date DATE NOT NULL,
  notes TEXT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Settings table
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  theme TEXT DEFAULT 'light',
  language TEXT DEFAULT 'ar',
  font_family TEXT DEFAULT 'system-ui',
  font_size TEXT DEFAULT 'medium',
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_artisans_national_id ON artisans(national_id);
CREATE INDEX IF NOT EXISTS idx_artisans_trade_id ON artisans(trade_id);
CREATE INDEX IF NOT EXISTS idx_artisans_is_active ON artisans(is_active);
CREATE INDEX IF NOT EXISTS idx_contributions_artisan_id ON contributions(artisan_id);
CREATE INDEX IF NOT EXISTS idx_contributions_payment_date ON contributions(payment_date);
CREATE INDEX IF NOT EXISTS idx_expenses_expense_date ON expenses(expense_date);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE artisans ENABLE ROW LEVEL SECURITY;
ALTER TABLE contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can view all users" ON users
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- سياسة للسماح لأي مستخدم مسجل دخول بإضافة مستخدمين جدد
CREATE POLICY "Authenticated users can insert users" ON users
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Only admins can delete users" ON users
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for trades
CREATE POLICY "Anyone can view trades" ON trades
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can modify trades" ON trades
  FOR ALL USING (auth.uid() IS NOT NULL);

-- RLS Policies for artisans
CREATE POLICY "Anyone can view artisans" ON artisans
  FOR SELECT USING (true);

CREATE POLICY "Secretary and Consultant can insert artisans" ON artisans
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('secretary', 'consultant', 'admin')
    )
  );

CREATE POLICY "Secretary and Consultant can update artisans" ON artisans
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('secretary', 'consultant', 'admin')
    )
  );

CREATE POLICY "Only admins can delete artisans" ON artisans
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for contributions
CREATE POLICY "Anyone can view contributions" ON contributions
  FOR SELECT USING (true);

CREATE POLICY "Writer and Treasurer can modify contributions" ON contributions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('writer', 'treasurer', 'admin')
    )
  );

-- RLS Policies for expenses
CREATE POLICY "Anyone can view expenses" ON expenses
  FOR SELECT USING (true);

CREATE POLICY "Writer and Treasurer can modify expenses" ON expenses
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('writer', 'treasurer', 'admin')
    )
  );

-- RLS Policies for settings
CREATE POLICY "Users can view own settings" ON settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can modify own settings" ON settings
  FOR ALL USING (auth.uid() = user_id);

-- Insert default trades
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
  ('معلم بناء', 'Maçon')
ON CONFLICT DO NOTHING;

-- Function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role, is_active)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
    COALESCE((NEW.raw_user_meta_data->>'is_active')::boolean, true)
  );
  
  INSERT INTO public.settings (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
