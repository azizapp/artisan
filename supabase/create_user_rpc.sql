-- دالة لإنشاء مستخدم جديد مع تجاوز مشاكل Auth
-- شغل هذا الكود في Supabase SQL Editor

CREATE OR REPLACE FUNCTION public.create_new_user(
  user_email TEXT,
  user_full_name TEXT,
  user_role TEXT DEFAULT 'writer',
  user_is_active BOOLEAN DEFAULT true
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id UUID;
BEGIN
  -- إنشاء UUID جديد
  new_user_id := gen_random_uuid();
  
  -- إضافة المستخدم في جدول users
  INSERT INTO public.users (id, email, full_name, role, is_active, created_at)
  VALUES (new_user_id, user_email, user_full_name, user_role, user_is_active, NOW())
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO new_user_id;
  
  -- إضافة الإعدادات الافتراضية
  INSERT INTO public.settings (user_id, theme, language, font_family, font_size)
  VALUES (new_user_id, 'light', 'ar', 'system-ui', 'medium')
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN new_user_id;
END;
$$;

-- إعطاء صلاحية التنفيذ للجميع
GRANT EXECUTE ON FUNCTION public.create_new_user(TEXT, TEXT, TEXT, BOOLEAN) TO anon;
GRANT EXECUTE ON FUNCTION public.create_new_user(TEXT, TEXT, TEXT, BOOLEAN) TO authenticated;

-- مثال للاستخدام:
-- SELECT public.create_new_user('test@example.com', 'اسم المستخدم', 'admin', true);
