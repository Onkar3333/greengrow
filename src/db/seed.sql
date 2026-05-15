-- Seed companies
INSERT OR IGNORE INTO companies (id, slug, name, name_mr, district, plan, verified) VALUES
(1, 'agritech-nashik',    'AgriTech Nashik',        'अॅग्रीटेक नाशिक',   'Nashik',   'premium', 1),
(2, 'green-inputs-pune',  'Green Inputs Pune',       'ग्रीन इनपुट्स पुणे', 'Pune',     'growth',  1),
(3, 'sangli-agro-corp',   'Sangli Agro Corporation', 'सांगली अॅग्रो',      'Sangli',   'growth',  1);

-- Seed products
INSERT OR IGNORE INTO products (slug, name, name_mr, category, price_min, price_max, unit, company_id, featured, crop_tags) VALUES
('hdpe-fruit-net-50m',     'HDPE Fruit Protection Net 50m',  'एचडीपीई फळ संरक्षण जाळी ५०म', 'nets',       120000, 180000, 'set',    1, 1, '["banana","grapes","pomegranate"]'),
('fruit-net-20m',          'Fruit Safety Net 20m',           'फळ संरक्षण जाळी २०म',          'nets',       35000,  55000,  'set',    2, 1, '["banana","mango","grapes"]'),
('bio-npk-5kg',            'Bio NPK Fertilizer 5kg',         'बायो एनपीके खत ५ किलो',        'fertilizer', 85000,  NULL,   'piece',  2, 1, '["banana","onion","mango"]'),
('drip-kit-1acre',         'Drip Irrigation Kit 1 Acre',     'ठिबक सिंचन किट १ एकर',         'drip',       350000, 420000, 'set',    1, 1, '["grapes","pomegranate","onion"]'),
('banana-tissue-culture',  'Banana Tissue Culture Plant',    'केळी टिश्यू कल्चर रोप',        'plants',     3500,   NULL,   'piece',  3, 1, '["banana"]'),
('onion-seeds-500g',       'Premium Onion Seeds 500g',       'प्रीमियम कांदा बी ५०० ग्रॅम',  'seeds',      65000,  NULL,   'piece',  3, 0, '["onion"]'),
('fungicide-spray-1l',     'Systemic Fungicide Spray 1L',    'सिस्टेमिक बुरशीनाशक १ लि',     'spray',      42000,  NULL,   'litre',  2, 0, '["grapes","mango","pomegranate"]'),
('farm-hand-tool-kit',     'Farm Hand Tool Kit 5pc',         'शेतकरी साधने किट ५ तुकडे',     'tools',      15000,  22000,  'set',    1, 1, '["banana","grapes","mango","onion"]');
