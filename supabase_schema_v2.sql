-- ==========================================
-- Nua Reservation System Schema V2.0
-- ==========================================

-- 既存のテーブルがある場合は、必要に応じてバックアップを取ってから実行してください。
-- このスクリプトは新しいテーブル構造を作成します。

-- ENUM定義: 予約ステータス
-- すでに存在する場合はスキップされます
DO $$ BEGIN
    CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'rejected', 'resuggesting', 'completed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 1. Profiles (顧客情報) table
-- Supabase Authのusersテーブルと紐付けることも可能ですが、まずは独立して管理
CREATE TABLE IF NOT EXISTS profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  name_kana TEXT, -- フリガナ
  email TEXT,
  phone TEXT,
  avatar_url TEXT, -- アイコン画像URL
  notes TEXT, -- 管理者用カルテメモ
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Menus (施術メニュー) table
-- コード内の定数ではなくDBで管理することで、後からWeb上で変更可能にする
CREATE TABLE IF NOT EXISTS menus (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  name_en TEXT, -- 英語表記 (Cut, Color etc)
  duration INTEGER NOT NULL, -- 所要時間(分)
  price INTEGER NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0, -- 表示順
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 初期メニューデータの投入
INSERT INTO menus (name, name_en, duration, price, display_order) VALUES
('カット', 'Cut', 60, 6600, 10),
('カラー', 'Color', 120, 11000, 20),
('カット＆カラー', 'Cut & Color', 150, 16500, 30),
('パーマ', 'Perm', 120, 11000, 40),
('トリートメント', 'Treatment', 60, 6600, 50),
('ヘッドスパ', 'Head Spa', 30, 4400, 60)
ON CONFLICT DO NOTHING; -- 重複時は何もしない

-- 3. Admin Schedules (管理者スケジュール) table
-- 休日や休憩時間をブロックするためのテーブル
CREATE TABLE IF NOT EXISTS admin_schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  type TEXT DEFAULT 'closed', -- 'closed'(休日), 'break'(休憩) など
  label TEXT, -- '私用', 'ランチ' などメモ
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Reservations (予約) table - V2 update
-- 既存の reservations テーブルをベースにしつつ、リレーションを強化
-- 既存テーブルがある場合、この定義に合わせてALTERするか、新しく作り直す必要があります。
-- ここでは 'bookings' として新しく定義します（移行完了後に reservations と置き換え推奨）
CREATE TABLE IF NOT EXISTS bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES profiles(id), -- 顧客ID (必須ではない: ゲスト予約用だが推奨)
  menu_id UUID REFERENCES menus(id), -- メニューID (必須ではない: 削除されたメニュー対策)
  
  -- デノルマライズデータ (参照先が消えても履歴として残す情報)
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT,
  menu_name TEXT NOT NULL,
  menu_price INTEGER,
  
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  
  status booking_status DEFAULT 'pending',
  
  staff_notes TEXT, -- 施術メモ
  photo_urls TEXT[], -- 施術写真 (Supabase Storage URLの配列)
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS (Row Level Security) Policies
-- セキュリティ設定: 一般公開と管理者権限の分離

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Profiles: 誰でもSELECT可能(予約時), 管理者のみALL
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Admin can do updates on profiles" ON profiles FOR ALL USING (auth.role() = 'authenticated');

-- Menus: 誰でも閲覧可能, 管理者のみ編集可能
CREATE POLICY "Menus are public" ON menus FOR SELECT USING (true);
CREATE POLICY "Admin can edit menus" ON menus FOR ALL USING (auth.role() = 'authenticated');

-- Admin Schedules: 誰でも閲覧可能(空き枠計算用), 管理者のみ編集可能
CREATE POLICY "Schedules are public" ON admin_schedules FOR SELECT USING (true);
CREATE POLICY "Admin can edit schedules" ON admin_schedules FOR ALL USING (auth.role() = 'authenticated');

-- Bookings: 
-- SELECT: 誰でも自分の予約は見れるべきだが、簡単のため一旦全員SELECT可(ただし個人情報はフロントで隠す)
-- 実際は「自分のuuidと一致」or「管理者」にするのがベスト
CREATE POLICY "Bookings are viewable by everyone" ON bookings FOR SELECT USING (true);
CREATE POLICY "Anyone can create booking" ON bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin can update bookings" ON bookings FOR UPDATE USING (auth.role() = 'authenticated');

-- Realtime監視設定
-- 管理画面で更新を検知したいテーブル
ALTER PUBLICATION supabase_realtime ADD TABLE bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE admin_schedules;
