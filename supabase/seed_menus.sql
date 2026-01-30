-- ==========================================
-- Nua Salon Menu Seed Data (最終版)
-- ==========================================
-- Supabase SQL Editor で実行してください

-- 1. 既存の予約データを削除（テストデータの場合）
DELETE FROM bookings;

-- 2. 既存メニューを削除
DELETE FROM menus;

-- 3. 新しいメニューを挿入

-- CUT カテゴリ
INSERT INTO menus (name, name_en, duration, price, description, display_order) VALUES
('カット', 'Cut', 60, 4400, '一般', 1),
('カット（大学・専門生）', 'Cut (College)', 60, 3850, '学生証提示', 2),
('カット（高校生）', 'Cut (High School)', 60, 3300, '学生証提示', 3),
('カット（小中学生）', 'Cut (Elementary)', 30, 2750, NULL, 4),
('カット（未就学児）', 'Cut (Preschool)', 30, 2200, NULL, 5),
('カット（1歳未満）', 'Cut (Under 1)', 30, 1650, NULL, 6);

-- COLOR カテゴリ
INSERT INTO menus (name, name_en, duration, price, description, display_order) VALUES
('根元リタッチ', 'Root Touch-up', 90, 6050, 'カラーのみ', 10),
('フルカラー ショート', 'Full Color Short', 90, 6600, 'カラーのみ', 11),
('フルカラー ミディアム', 'Full Color Medium', 120, 7150, 'カラーのみ', 12),
('フルカラー ロング', 'Full Color Long', 120, 7700, 'カラーのみ', 13),
('ブリーチ', 'Bleach', 240, 6600, '価格は目安です（長さ・回数により変動）', 14),
('デザインカラー（※ハイライトカラー）', 'Design Color', 240, 6600, 'ハイライト等の特殊カラー', 15);

-- CUT + COLOR カテゴリ
INSERT INTO menus (name, name_en, duration, price, description, display_order) VALUES
('カット + 根元リタッチ', 'Cut + Root Touch-up', 120, 8800, NULL, 20),
('カット + フルカラー ショート', 'Cut + Full Color Short', 120, 9450, NULL, 21),
('カット + フルカラー ミディアム', 'Cut + Full Color Medium', 120, 9900, NULL, 22),
('カット + フルカラー ロング', 'Cut + Full Color Long', 150, 10450, NULL, 23);

-- PERM カテゴリ
INSERT INTO menus (name, name_en, duration, price, description, display_order) VALUES
('パーマ', 'Perm', 120, 8800, NULL, 30),
('デジタルパーマ', 'Digital Perm', 150, 9900, 'コテ巻き風の形状記憶パーマ', 31),
('ストレートパーマ', 'Straight Perm', 150, 11550, '価格は目安です', 32),
('縮毛矯正', 'Japanese Straightening', 210, 16500, '価格は目安です', 33);

-- TREATMENT カテゴリ（メインメニュー）
INSERT INTO menus (name, name_en, duration, price, description, display_order) VALUES
('トリートメント（ブローのみ）', 'Treatment (Blow only)', 30, 3850, NULL, 40);

-- HEAD SPA カテゴリ（メインメニュー）
INSERT INTO menus (name, name_en, duration, price, description, display_order) VALUES
('ヘッドスパ 30min', 'Head Spa 30min', 30, 3300, NULL, 51);

-- OTHER カテゴリ
INSERT INTO menus (name, name_en, duration, price, description, display_order) VALUES
('Set', 'Set', 60, 4400, 'セット', 60),
('ブロー', 'Blow', 30, 1650, NULL, 61),
('シャンプー', 'Shampoo', 30, 770, NULL, 62);

-- 追加オプション（Setメニュー）
-- ※メインメニュー選択後に追加選択可能
INSERT INTO menus (name, name_en, duration, price, description, display_order) VALUES
('トリートメント（Set）', 'Treatment (Set)', 30, 2200, '他メニューと併用', 70),
('ヘッドスパ 15min（Set）', 'Head Spa 15min (Set)', 15, 2200, '他メニューと併用', 71);
