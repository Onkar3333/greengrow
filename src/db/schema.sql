-- Products listed by agricultural companies
CREATE TABLE IF NOT EXISTS products (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  slug        TEXT    NOT NULL UNIQUE,
  name        TEXT    NOT NULL,
  name_mr     TEXT,                          -- Marathi name
  category    TEXT    NOT NULL,              -- 'nets' | 'fertilizer' | 'drip' | 'plants' | 'seeds' | 'spray' | 'tools'
  description TEXT,
  description_mr TEXT,
  price_min   INTEGER NOT NULL,              -- in paise (₹1 = 100 paise)
  price_max   INTEGER,
  unit        TEXT    NOT NULL DEFAULT 'piece', -- 'kg' | 'litre' | 'piece' | 'set' | 'metre'
  company_id  INTEGER NOT NULL REFERENCES companies(id),
  image_key   TEXT,                          -- R2 object key
  in_stock    INTEGER NOT NULL DEFAULT 1,    -- boolean
  featured    INTEGER NOT NULL DEFAULT 0,    -- boolean
  crop_tags   TEXT    DEFAULT '[]',          -- JSON array: ['banana','onion','grapes','mango']
  created_at  INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at  INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Agricultural companies / suppliers on the platform
CREATE TABLE IF NOT EXISTS companies (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  slug        TEXT    NOT NULL UNIQUE,
  name        TEXT    NOT NULL,
  name_mr     TEXT,
  description TEXT,
  phone       TEXT,
  email       TEXT,
  state       TEXT    NOT NULL DEFAULT 'Maharashtra',
  district    TEXT,
  plan        TEXT    NOT NULL DEFAULT 'free',  -- 'free' | 'growth' | 'premium'
  verified    INTEGER NOT NULL DEFAULT 0,
  logo_key    TEXT,
  created_at  INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Farmer enquiries / WhatsApp leads
CREATE TABLE IF NOT EXISTS leads (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT    NOT NULL,
  phone       TEXT    NOT NULL,
  district    TEXT,
  crop        TEXT,                          -- their primary crop
  message     TEXT,
  product_id  INTEGER REFERENCES products(id),
  source      TEXT    DEFAULT 'website',     -- 'website' | 'whatsapp' | 'referral'
  status      TEXT    NOT NULL DEFAULT 'new', -- 'new' | 'contacted' | 'converted' | 'closed'
  created_at  INTEGER NOT NULL DEFAULT (unixepoch())
);

-- WhatsApp order requests (pre-order intent, not full e-commerce)
CREATE TABLE IF NOT EXISTS order_requests (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  farmer_name TEXT    NOT NULL,
  phone       TEXT    NOT NULL,
  district    TEXT,
  items       TEXT    NOT NULL DEFAULT '[]', -- JSON: [{product_id, qty, unit}]
  total_est   INTEGER,                       -- estimated total in paise
  wa_thread   TEXT,                          -- WhatsApp thread identifier if available
  status      TEXT    NOT NULL DEFAULT 'pending', -- 'pending' | 'confirmed' | 'dispatched' | 'delivered'
  notes       TEXT,
  created_at  INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at  INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Newsletter / notification opt-ins
CREATE TABLE IF NOT EXISTS subscribers (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  phone      TEXT    UNIQUE,
  name       TEXT,
  district   TEXT,
  crop       TEXT,
  lang       TEXT    NOT NULL DEFAULT 'mr',  -- 'mr' | 'en'
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_products_category   ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_company_id ON products(company_id);
CREATE INDEX IF NOT EXISTS idx_products_featured   ON products(featured);
CREATE INDEX IF NOT EXISTS idx_leads_status        ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at    ON leads(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_status       ON order_requests(status);
