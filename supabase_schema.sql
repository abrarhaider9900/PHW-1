-- Performance Horse World (PHW) - Supabase Database Schema

-- 1. Profiles Table (Extends Supabase Auth)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  functional_roles TEXT[] DEFAULT '{}',
  avatar_url TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'banned', 'pending')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Disciplines Table
CREATE TABLE public.disciplines (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE,
  description TEXT
);

INSERT INTO public.disciplines (name) VALUES 
('Barrel Racing'), ('Tie-Down Roping'), ('Team Roping'), ('Reining'), ('Cutting');

-- 3. Trainers Table
CREATE TABLE public.trainers (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT,
  specialties TEXT[], -- Array of strings
  phone TEXT,
  email TEXT,
  bio TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Horses Table
CREATE TABLE public.horses (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  breed TEXT,
  color TEXT,
  sex TEXT CHECK (sex IN ('Stallion', 'Mare', 'Gelding', 'Colt', 'Filly')),
  birth_year INTEGER,
  birth_date DATE,
  registry TEXT,
  sire TEXT,
  dam TEXT,
  owner_id UUID REFERENCES public.profiles(id),
  trainer_id INTEGER REFERENCES public.trainers(id),
  image_url TEXT,
  video_url TEXT,
  is_for_sale BOOLEAN DEFAULT FALSE,
  sale_price DECIMAL(12,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Events Table
CREATE TABLE public.events (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  date DATE NOT NULL,
  venue TEXT,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'USA',
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Performances Table
CREATE TABLE public.performances (
  id SERIAL PRIMARY KEY,
  horse_id INTEGER REFERENCES public.horses(id) ON DELETE CASCADE,
  event_id INTEGER REFERENCES public.events(id) ON DELETE CASCADE,
  discipline_id INTEGER REFERENCES public.disciplines(id),
  event_name TEXT,
  event_type TEXT,
  time_or_score TEXT,
  est_time TEXT,
  "placing" INTEGER,
  total_entries INTEGER,
  rodeo_contest TEXT,
  season TEXT,
  prize_money DECIMAL(12,2),
  performance_date DATE,
  country TEXT DEFAULT 'USA',
  state TEXT,
  city TEXT,
  priority TEXT,
  video_url TEXT,
  result_doc_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Horse Follows Table
CREATE TABLE public.horse_follows (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  horse_id INTEGER REFERENCES public.horses(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, horse_id)
);

-- 8. Sponsors Table
CREATE TABLE public.sponsors (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  image_url TEXT,
  link_url TEXT,
  "position" TEXT CHECK ("position" IN ('sidebar', 'footer', 'top', 'bottom')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Site Settings Table
CREATE TABLE public.site_settings (
  key TEXT PRIMARY KEY,
  value JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed initial settings
INSERT INTO public.site_settings (key, value) VALUES 
('site_name', '"Performance Horse World"'),
('contact_email', '"info@performancehorseworld.com"'),
('contact_phone', '"(123) 456-7890"'),
('social_links', '{"facebook": "", "instagram": "", "youtube": ""}');

-- 10. Row Level Security (RLS)

-- Profiles: Users can read all profiles (to see horse owners), but only update their own
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Public Data: Everyone can read, only Admins can write
CREATE POLICY "Public data is viewable by everyone" ON public.disciplines FOR SELECT USING (true);
CREATE POLICY "Public data is viewable by everyone" ON public.trainers FOR SELECT USING (true);
CREATE POLICY "Public data is viewable by everyone" ON public.horses FOR SELECT USING (true);
CREATE POLICY "Public data is viewable by everyone" ON public.events FOR SELECT USING (true);
CREATE POLICY "Public data is viewable by everyone" ON public.performances FOR SELECT USING (true);
CREATE POLICY "Public data is viewable by everyone" ON public.sponsors FOR SELECT USING (true);

-- Admin Write Policies (Pattern: Only users with 'admin' role in profiles can write)
-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin() RETURNS BOOLEAN AS $$
  SELECT role = 'admin' FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

CREATE POLICY "Admins can manage disciplines" ON public.disciplines FOR ALL USING (public.is_admin());
CREATE POLICY "Admins can manage trainers" ON public.trainers FOR ALL USING (public.is_admin());
CREATE POLICY "Admins can manage horses" ON public.horses FOR ALL USING (public.is_admin());
CREATE POLICY "Owners can manage own horses" ON public.horses FOR ALL USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Admins can manage events" ON public.events FOR ALL USING (public.is_admin());

CREATE POLICY "Admins can manage performances" ON public.performances FOR ALL USING (public.is_admin());
CREATE POLICY "Owners can manage own performances" ON public.performances FOR ALL 
  USING (EXISTS (SELECT 1 FROM public.horses WHERE id = horse_id AND owner_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.horses WHERE id = horse_id AND owner_id = auth.uid()));
CREATE POLICY "Admins can manage sponsors" ON public.sponsors FOR ALL USING (public.is_admin());

-- Enable RLS on all tables
ALTER TABLE public.disciplines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trainers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.horses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.horse_follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public settings are viewable by everyone" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage site settings" ON public.site_settings FOR ALL USING (public.is_admin());

-- Horse Follows: Users can manage their own follows
CREATE POLICY "Users can view their own follows" ON public.horse_follows FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can follow/unfollow" ON public.horse_follows FOR ALL USING (auth.uid() = user_id);
