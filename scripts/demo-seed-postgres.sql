-- Demo data for presentations (PostgreSQL / Supabase).
-- Run once in the SQL editor AFTER tables exist.
-- Safe to re-run: uses INSERT ... ON CONFLICT DO NOTHING where possible.

-- ─── Suppliers ───────────────────────────────────────────────────────────────
INSERT INTO suppliers (name, contact_person, phone, email, address, notes, active, created_at)
VALUES
  ('TechZone Ghana',    'Kofi Asante',   '0244100001', 'kofi@techzone.gh',    'Accra Mall, Accra',       'Main electronics supplier',   true, NOW()),
  ('FreshMart Ltd',     'Abena Owusu',   '0244100002', 'abena@freshmart.gh',  'Kejetia Market, Kumasi',  'Food & beverages distributor', true, NOW()),
  ('OfficeHub Ghana',   'Yaw Mensah',    '0244100003', 'yaw@officehub.gh',    'Ring Road, Accra',        'Stationery & office supplies', true, NOW()),
  ('StyleWear Accra',   'Ama Boateng',   '0244100004', 'ama@stylewear.gh',    'Osu, Accra',              'Clothing & apparel',           true, NOW())
ON CONFLICT DO NOTHING;

-- ─── Customers ───────────────────────────────────────────────────────────────
INSERT INTO customers (name, phone, email, address, loyalty_points, created_at)
VALUES
  ('Walk-in Customer',  NULL,           NULL,                      NULL,              0,   NOW() - INTERVAL '30 days'),
  ('Kwame Asante',      '0244200001',   'kwame@gmail.com',         'East Legon, Accra',   250, NOW() - INTERVAL '25 days'),
  ('Ama Mensah',        '0244200002',   'ama.mensah@gmail.com',    'Kumasi, Ashanti',     180, NOW() - INTERVAL '20 days'),
  ('Kofi Boateng',      '0244200003',   'kofi.b@yahoo.com',        'Tema, Greater Accra', 320, NOW() - INTERVAL '18 days'),
  ('Abena Owusu',       '0244200004',   'abena.o@gmail.com',       'Takoradi, Western',   90,  NOW() - INTERVAL '15 days'),
  ('Yaw Darko',         '0244200005',   'yaw.darko@outlook.com',   'Sunyani, Brong',      410, NOW() - INTERVAL '12 days'),
  ('Akosua Frimpong',   '0244200006',   'akosua.f@gmail.com',      'Osu, Accra',          60,  NOW() - INTERVAL '10 days'),
  ('Nana Adjei',        '0244200007',   'nana.adjei@gmail.com',    'Madina, Accra',       150, NOW() - INTERVAL '7 days')
ON CONFLICT DO NOTHING;

-- ─── Products ────────────────────────────────────────────────────────────────
INSERT INTO products (name, category, price, quantity, barcode, supplier, low_stock_threshold, active)
VALUES
  -- Electronics
  ('Samsung Galaxy A15',        'Electronics',        899.00,  12, '8806095076325', 'TechZone Ghana',  5,  true),
  ('Tecno Spark 20',            'Electronics',        650.00,  18, '6934177779305', 'TechZone Ghana',  5,  true),
  ('Bluetooth Earbuds Pro',     'Electronics',        120.00,  35, '5901234100001', 'TechZone Ghana',  10, true),
  ('USB-C Fast Charger 65W',    'Electronics',         55.00,  50, '5901234100002', 'TechZone Ghana',  15, true),
  ('Power Bank 20000mAh',       'Electronics',        180.00,  22, '5901234100003', 'TechZone Ghana',  8,  true),
  ('HDMI Cable 2m',             'Electronics',         25.00,  60, '5901234100004', 'TechZone Ghana',  20, true),
  -- Food & Beverages
  ('Bottled Water 500ml',       'Food & Beverages',     3.50,  200, '8850123456001', 'FreshMart Ltd',  50, true),
  ('Coca-Cola 330ml Can',       'Food & Beverages',     5.00,  144, '5449000000996', 'FreshMart Ltd',  48, true),
  ('Milo 400g Tin',             'Food & Beverages',    28.00,   40, '8850123456002', 'FreshMart Ltd',  10, true),
  ('Indomie Noodles (pack)',    'Food & Beverages',     4.50,  120, '8850123456003', 'FreshMart Ltd',  30, true),
  ('Mineral Water 1.5L',        'Food & Beverages',     6.00,   96, '8850123456004', 'FreshMart Ltd',  24, true),
  -- Books & Stationery
  ('Notebook A4 80 pages',      'Books & Stationery',  12.00,   80, NULL,            'OfficeHub Ghana', 20, true),
  ('Ballpoint Pen (box of 10)', 'Books & Stationery',  15.00,   60, NULL,            'OfficeHub Ghana', 15, true),
  ('Stapler Heavy Duty',        'Books & Stationery',  35.00,   25, NULL,            'OfficeHub Ghana', 5,  true),
  ('A4 Printing Paper (ream)',  'Books & Stationery',  55.00,   30, NULL,            'OfficeHub Ghana', 8,  true),
  -- Clothing & Apparel
  ('Men''s Polo Shirt (L)',     'Clothing & Apparel',  85.00,   20, NULL,            'StyleWear Accra', 5,  true),
  ('Ladies Ankara Dress',       'Clothing & Apparel', 150.00,   15, NULL,            'StyleWear Accra', 3,  true),
  ('School Uniform Set',        'Clothing & Apparel',  95.00,   25, NULL,            'StyleWear Accra', 5,  true),
  -- Health & Beauty
  ('Vaseline 250ml',            'Health & Beauty',     18.00,   45, '8712561000001', 'FreshMart Ltd',  10, true),
  ('Dettol Soap (pack of 3)',   'Health & Beauty',     22.00,   60, '8712561000002', 'FreshMart Ltd',  15, true)
ON CONFLICT DO NOTHING;
