// User Types
export type UserRole = 'admin' | 'writer' | 'treasurer' | 'secretary' | 'consultant';

export interface User {
  id: string;
  email: string;
  full_name: string;
  password?: string;
  role: UserRole;
  is_active?: boolean;
  created_at: string;
}

// Trade Types
export interface Trade {
  id: string;
  name_ar: string;
  name_fr: string;
  created_at: string;
}

// Artisan Types
export type ShopType = 'owner' | 'tenant' | 'manager';

export interface Artisan {
  id: string;
  full_name: string;
  national_id: string;
  phone?: string | null;
  shop_number: string;
  area: string;
  employee_count: number;
  shop_type: ShopType;
  trade_id: string;
  trade?: Trade;
  documents: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  name: string;
  url: string;
  type: string;
  uploaded_at: string;
}

// Contribution Types
export interface Contribution {
  id: string;
  artisan_id: string;
  artisan?: any;
  occasion: string;
  amount: number;
  payment_date: string;
  notes?: string | null;
  created_at: string;
}

// Expense Types
export interface Expense {
  id: string;
  subject: string;
  amount: number;
  expense_date: string;
  notes?: string | null;
  created_by?: string | null;
  created_at: string;
}

// Settings Types
export interface Settings {
  id: string;
  theme: 'light' | 'dark';
  language: 'ar' | 'fr';
  font_family: string;
  font_size: 'small' | 'medium' | 'large';
  user_id: string;
}

// Dashboard Stats
export interface DashboardStats {
  total_artisans: number;
  active_artisans: number;
  total_contributions: number;
  monthly_revenue: number;
  total_expenses: number;
}

// Notification Types
export type NotificationType = 'artisan' | 'contribution' | 'expense' | 'trade' | 'user';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  created_by_name: string;
  is_read: boolean;
  created_at: string;
}

export interface NotificationFormData {
  type: NotificationType;
  title: string;
  description: string;
  created_by_name: string;
}

// Form Types
export interface ArtisanFormData {
  full_name: string;
  national_id: string;
  phone?: string;
  shop_number: string;
  area: string;
  employee_count: number;
  shop_type: ShopType;
  trade_id: string;
  is_active: boolean;
}

export interface ContributionFormData {
  artisan_id: string;
  occasion: string;
  amount: number;
  payment_date: string;
  notes?: string;
}

export interface ExpenseFormData {
  subject: string;
  amount: number;
  expense_date: string;
  notes?: string;
}

export interface TradeFormData {
  name_ar: string;
  name_fr: string;
}
