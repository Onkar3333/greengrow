import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import type { Env } from "@/env";
import { MongoClient, oid } from "@/lib/mongodb";
import { hashPassword, verifyPassword, signJWT, verifyJWT } from "@/lib/auth";

// ── Helpers ───────────────────────────────────────────────────────────────────

function getEnv(): Env {
  const req = getRequest();
  return (req as unknown as { env: Env }).env;
}

function getMongo(env: Env): MongoClient {
  if (!env.MONGODB_URI) {
    throw new Error("Missing MONGODB_URI variable");
  }
  return new MongoClient(env.MONGODB_URI, "", env.MONGODB_DB || "greengear");
}

function getJWTSecret(env: Env): string {
  return env.JWT_SECRET ?? "dev-secret-change-in-production";
}

async function getRateLimitEnv(env: Env, ip: string, action: string): Promise<boolean> {
  if (!env.KV) return true;
  const key = `rl:${action}:${ip}`;
  const current = await env.KV.get(key);
  const count = current ? parseInt(current) : 0;
  if (count >= 20) return false;
  await env.KV.put(key, String(count + 1), { expirationTtl: 60 });
  return true;
}

function priceFmt(paise: number): string {
  return `₹${(paise / 100).toLocaleString("en-IN")}`;
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Product {
  _id:            string;
  name:           string;
  name_mr:        string | null;
  category:       string;
  price:          number;
  price_max:      number | null;
  price_display:  string;
  unit:           string;
  description:    string | null;
  description_mr: string | null;
  image_url:      string | null;
  in_stock:       boolean;
  featured:       boolean;
  supplier_id:    string;
  supplier_name:  string;
  savings_pct:    number;
  crop_tags:      string[];
  createdAt:      string;
}

export interface User {
  _id:     string;
  email:   string;
  name:    string;
  phone:   string;
  role:    "farmer" | "supplier";
  company: string | null;
  district:string | null;
}

export interface Order {
  _id:          string;
  farmer_id:    string;
  farmer_name:  string;
  phone:        string;
  district:     string | null;
  items:        { product_id: string; product_name: string; qty: number; price: number }[];
  total:        number;
  status:       "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  notes:        string | null;
  createdAt:    string;
}

// ── AUTH — Signup ─────────────────────────────────────────────────────────────

export const authSignup = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    email:    z.string().email(),
    password: z.string().min(6).max(100),
    name:     z.string().min(2).max(80),
    phone:    z.string().regex(/^[6-9]\d{9}$/),
    role:     z.enum(["farmer", "supplier"]),
    company:  z.string().max(100).optional(),
    district: z.string().max(50).optional(),
  }))
  .handler(async ({ data }) => {
    const env = getEnv();
    const mongo = getMongo(env);
    const users = mongo.collection("users");

    // Check duplicate email
    const existing = await users.findOne({ email: data.email });
    if (existing.document) throw new Error("Email already registered. Please login.");

    const passwordHash = await hashPassword(data.password);
    const now = new Date().toISOString();

    const res = await users.insertOne({
      email: data.email, passwordHash,
      name: data.name, phone: data.phone,
      role: data.role,
      company: data.company ?? null,
      district: data.district ?? null,
      verified: false, createdAt: now,
    });

    const token = await signJWT(
      { sub: res.insertedId, email: data.email, name: data.name, role: data.role },
      getJWTSecret(env),
    );
    return { token, user: { _id: res.insertedId, email: data.email, name: data.name, role: data.role } };
  });

// ── AUTH — Login ──────────────────────────────────────────────────────────────

export const authLogin = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    email:    z.string().email(),
    password: z.string().min(1),
  }))
  .handler(async ({ data }) => {
    const env = getEnv();
    const mongo = getMongo(env);

    const req = getRequest();
    const ip = req.headers.get("CF-Connecting-IP") ?? "unknown";
    const allowed = await getRateLimitEnv(env, ip, "login");
    if (!allowed) throw new Error("Too many login attempts. Try again in 1 minute.");

    const res = await mongo.collection("users").findOne<{
      _id: { $oid: string }; email: string; passwordHash: string; name: string; role: "farmer"|"supplier";
    }>({ email: data.email });

    if (!res.document) throw new Error("No account found with this email.");
    const ok = await verifyPassword(data.password, res.document.passwordHash);
    if (!ok) throw new Error("Incorrect password.");

    const id = typeof res.document._id === "object" ? res.document._id.$oid : res.document._id;
    const token = await signJWT(
      { sub: id, email: res.document.email, name: res.document.name, role: res.document.role },
      getJWTSecret(env),
    );
    return { token, user: { _id: id, email: res.document.email, name: res.document.name, role: res.document.role } };
  });

// ── AUTH — Verify token (get current user) ────────────────────────────────────

export const authMe = createServerFn({ method: "GET" })
  .handler(async () => {
    const env = getEnv();
    const req = getRequest();
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "");
    if (!token) throw new Error("Not authenticated.");
    const payload = await verifyJWT(token, getJWTSecret(env));
    if (!payload) throw new Error("Invalid or expired token.");
    return payload;
  });

// ── PRODUCTS — Get list (MongoDB) ─────────────────────────────────────────────

export const getProducts = createServerFn({ method: "GET" })
  .inputValidator(z.object({
    category:    z.string().optional(),
    crop:        z.string().optional(),
    search:      z.string().optional(),
    featured:    z.boolean().optional(),
    supplier_id: z.string().optional(),
    limit:       z.number().min(1).max(100).default(40),
    skip:        z.number().min(0).default(0),
  }))
  .handler(async ({ data }) => {
    const env = getEnv();
    // KV cache (skip for supplier-scoped queries)
    const cacheKey = `products:${JSON.stringify(data)}`;
    if (env.KV && !data.supplier_id) {
      const cached = await env.KV.get(cacheKey, "json").catch(() => null);
      if (cached) return cached as Product[];
    }

    const filter: Record<string, unknown> = { in_stock: true };
    if (data.category)    filter.category    = data.category;
    if (data.featured)    filter.featured    = true;
    if (data.supplier_id) filter.supplier_id = data.supplier_id;
    if (data.crop)        filter.crop_tags   = { $in: [data.crop] };
    if (data.search) {
      filter.$or = [
        { name:    { $regex: data.search, $options: "i" } },
        { name_mr: { $regex: data.search, $options: "i" } },
      ];
    }

    try {
      const mongo = getMongo(env);
      const res = await mongo.collection("products").find<Product>(filter, {
        sort: { featured: -1, createdAt: -1 },
        limit: data.limit, skip: data.skip,
      });
      const products = res.documents.map(p => ({
        ...p,
        _id: typeof p._id === "object" ? (p._id as { $oid: string }).$oid : p._id,
        price_display: p.price_max
          ? `${priceFmt(p.price)} – ${priceFmt(p.price_max)}`
          : priceFmt(p.price),
        in_stock: Boolean(p.in_stock),
        featured: Boolean(p.featured),
        crop_tags: Array.isArray(p.crop_tags) ? p.crop_tags : [],
      }));
      if (env.KV && !data.supplier_id) {
        await env.KV.put(cacheKey, JSON.stringify(products), { expirationTtl: 120 }).catch(() => {});
      }
      return products;
    } catch {
      // Return empty array if MongoDB not configured yet
      return [] as Product[];
    }
  });

// ── PRODUCTS — Add (Supplier only) ───────────────────────────────────────────

export const addProduct = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    token:          z.string(),
    name:           z.string().min(2).max(120),
    name_mr:        z.string().max(120).optional(),
    category:       z.enum(["nets","fertilizer","drip","seeds","spray","tools","plants"]),
    price:          z.number().min(1),
    price_max:      z.number().optional(),
    unit:           z.string().min(1).max(30),
    description:    z.string().max(1000).optional(),
    description_mr: z.string().max(1000).optional(),
    image_url:      z.string().url().optional(),
    in_stock:       z.boolean().default(true),
    featured:       z.boolean().default(false),
    savings_pct:    z.number().min(0).max(80).default(0),
    crop_tags:      z.array(z.string()).default([]),
  }))
  .handler(async ({ data }) => {
    const env = getEnv();
    const payload = await verifyJWT(data.token, getJWTSecret(env));
    if (!payload || payload.role !== "supplier") throw new Error("Only suppliers can add products.");

    const mongo = getMongo(env);
    const now = new Date().toISOString();
    const { token: _, ...productData } = data;

    const res = await mongo.collection("products").insertOne({
      ...productData,
      price: Math.round(data.price * 100), // store in paise
      price_max: data.price_max ? Math.round(data.price_max * 100) : null,
      supplier_id: payload.sub,
      supplier_name: payload.name,
      in_stock: true, createdAt: now,
    });

    // Invalidate cache
    if (env.KV) await env.KV.delete(`products:`).catch(() => {});

    return { success: true, productId: res.insertedId };
  });

// ── PRODUCTS — Update (Supplier only) ────────────────────────────────────────

export const updateProduct = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    token:      z.string(),
    product_id: z.string(),
    updates:    z.record(z.unknown()),
  }))
  .handler(async ({ data }) => {
    const env = getEnv();
    const payload = await verifyJWT(data.token, getJWTSecret(env));
    if (!payload || payload.role !== "supplier") throw new Error("Unauthorized.");

    const mongo = getMongo(env);
    await mongo.collection("products").updateOne(
      { _id: oid(data.product_id), supplier_id: payload.sub },
      { $set: { ...data.updates, updatedAt: new Date().toISOString() } },
    );
    return { success: true };
  });

// ── PRODUCTS — Delete (Supplier only) ────────────────────────────────────────

export const deleteProduct = createServerFn({ method: "POST" })
  .inputValidator(z.object({ token: z.string(), product_id: z.string() }))
  .handler(async ({ data }) => {
    const env = getEnv();
    const payload = await verifyJWT(data.token, getJWTSecret(env));
    if (!payload || payload.role !== "supplier") throw new Error("Unauthorized.");

    const mongo = getMongo(env);
    await mongo.collection("products").deleteOne({ _id: oid(data.product_id), supplier_id: payload.sub });
    return { success: true };
  });

// ── ORDERS — Place order (Farmer) ─────────────────────────────────────────────

export const placeOrder = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    token:    z.string().optional(),
    name:     z.string().min(2).max(80),
    phone:    z.string().regex(/^[6-9]\d{9}$/),
    district: z.string().optional(),
    items:    z.array(z.object({
      product_id:   z.string(),
      product_name: z.string(),
      qty:          z.number().min(1),
      price:        z.number(),
    })).min(1),
    notes: z.string().max(300).optional(),
  }))
  .handler(async ({ data }) => {
    const env = getEnv();
    let farmerId: string | null = null;

    if (data.token) {
      const p = await verifyJWT(data.token, getJWTSecret(env));
      if (p) farmerId = p.sub;
    }

    const req = getRequest();
    const ip = req.headers.get("CF-Connecting-IP") ?? "unknown";
    if (env.KV) {
      const ok = await getRateLimitEnv(env, ip, "order");
      if (!ok) throw new Error("Too many requests. Try again in 1 minute.");
    }

    const total = data.items.reduce((s, i) => s + i.price * i.qty, 0);
    const now = new Date().toISOString();

    try {
      const mongo = getMongo(env);
      const res = await mongo.collection("orders").insertOne({
        farmer_id: farmerId, farmer_name: data.name,
        phone: data.phone, district: data.district ?? null,
        items: data.items, total,
        status: "pending", notes: data.notes ?? null,
        whatsapp_sent: false, createdAt: now,
      });

      const itemLines = data.items.map(i => `• ${i.product_name} × ${i.qty}`).join("\n");
      const supportPhone = env.SUPPORT_PHONE ?? "910000000000";
      const waMsg = encodeURIComponent(
        `नमस्कार! GreenGear वर ऑर्डर:\n${itemLines}\nनाव: ${data.name}\nफोन: ${data.phone}${data.district ? "\nजिल्हा: " + data.district : ""}\nOrder ID: ${res.insertedId}`
      );
      const waLink = `https://wa.me/${supportPhone}?text=${waMsg}`;

      return { success: true, order_id: res.insertedId, whatsapp_link: waLink, total };
    } catch (e) {
      // Fallback WA link even if DB fails
      const itemLines = data.items.map(i => `• ${i.product_name} × ${i.qty}`).join("\n");
      const supportPhone = env.SUPPORT_PHONE ?? "910000000000";
      const waMsg = encodeURIComponent(`नमस्कार! GreenGear वर ऑर्डर:\n${itemLines}\nनाव: ${data.name}\nफोन: ${data.phone}`);
      return { success: true, order_id: null, whatsapp_link: `https://wa.me/${supportPhone}?text=${waMsg}`, total };
    }
  });

// ── ORDERS — Get farmer's orders ─────────────────────────────────────────────

export const getMyOrders = createServerFn({ method: "POST" })
  .inputValidator(z.object({ token: z.string() }))
  .handler(async ({ data }) => {
    const env = getEnv();
    const payload = await verifyJWT(data.token, getJWTSecret(env));
    if (!payload) throw new Error("Not authenticated.");

    const mongo = getMongo(env);
    const res = await mongo.collection("orders").find<Order>(
      { farmer_id: payload.sub },
      { sort: { createdAt: -1 }, limit: 50 },
    );
    return res.documents.map(o => ({
      ...o,
      _id: typeof o._id === "object" ? (o._id as { $oid: string }).$oid : o._id,
    }));
  });

// ── ORDERS — Get supplier's incoming orders ───────────────────────────────────

export const getSupplierOrders = createServerFn({ method: "POST" })
  .inputValidator(z.object({ token: z.string() }))
  .handler(async ({ data }) => {
    const env = getEnv();
    const payload = await verifyJWT(data.token, getJWTSecret(env));
    if (!payload || payload.role !== "supplier") throw new Error("Unauthorized.");

    const mongo = getMongo(env);
    // Get orders containing any of this supplier's products
    const myProducts = await mongo.collection("products").find<{ _id: { $oid: string } }>(
      { supplier_id: payload.sub }, { projection: { _id: 1 } },
    );
    const productIds = myProducts.documents.map(p =>
      typeof p._id === "object" ? p._id.$oid : p._id
    );
    if (!productIds.length) return [];

    const res = await mongo.collection("orders").find<Order>(
      { "items.product_id": { $in: productIds } },
      { sort: { createdAt: -1 }, limit: 100 },
    );
    return res.documents.map(o => ({
      ...o,
      _id: typeof o._id === "object" ? (o._id as { $oid: string }).$oid : o._id,
    }));
  });

// ── ORDERS — Update order status (Supplier) ───────────────────────────────────

export const updateOrderStatus = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    token:    z.string(),
    order_id: z.string(),
    status:   z.enum(["pending","confirmed","shipped","delivered","cancelled"]),
  }))
  .handler(async ({ data }) => {
    const env = getEnv();
    const payload = await verifyJWT(data.token, getJWTSecret(env));
    if (!payload || payload.role !== "supplier") throw new Error("Unauthorized.");

    const mongo = getMongo(env);
    await mongo.collection("orders").updateOne(
      { _id: oid(data.order_id) },
      { $set: { status: data.status, updatedAt: new Date().toISOString() } },
    );
    return { success: true };
  });

// ── AI CROP RECOMMENDATIONS ───────────────────────────────────────────────────

export const getCropRecommendations = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    crop:     z.string().min(2).max(50),
    district: z.string().optional(),
    lang:     z.enum(["en", "mr"]).default("en"),
  }))
  .handler(async ({ data }) => {
    let env: Env | null = null;
    try { env = getEnv(); } catch { env = null; }

    type Rec = { category: string; product_name: string; reason: string };

    if (env?.KV) {
      try {
        const cached = await env.KV.get(`ai:reco:${data.crop}:${data.district ?? "any"}:${data.lang}`, "json");
        if (cached) return cached as Rec[];
      } catch { /* miss */ }
    }

    if (env?.AI) {
      try {
        const isMr = data.lang === "mr";
        const prompt = isMr
          ? `तुम्ही भारतीय कृषी तज्ञ आहात. ${data.crop} पिकासाठी ${data.district ?? "महाराष्ट्र"} मध्ये लागणाऱ्या ५ शेती इनपुट्सची JSON array द्या: [{"category":"...","product_name":"...","reason":"..."}]`
          : `You are an Indian agri expert. For ${data.crop} in ${data.district ?? "Maharashtra"}, give 5 essential farm inputs as JSON array only: [{"category":"...","product_name":"...","reason":"..."}]`;

        const aiRes = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
          messages: [{ role: "user", content: prompt }],
          max_tokens: 500,
        });
        const text = (aiRes as { response: string }).response;
        const match = text.match(/\[[\s\S]*\]/);
        if (match) {
          const recs = JSON.parse(match[0]) as Rec[];
          if (env.KV && recs.length) {
            await env.KV.put(`ai:reco:${data.crop}:${data.district ?? "any"}:${data.lang}`, JSON.stringify(recs), { expirationTtl: 86400 });
          }
          return recs;
        }
      } catch (e) { console.error("AI error:", e); }
    }

    // Offline mock data
    const isMr = data.lang === "mr";
    const c = data.crop.toLowerCase();
    const MOCKS: Record<string, Rec[]> = {
      banana: [
        { category:"Fertilizer",    product_name: isMr?"NPK 19:19:19 खत":"NPK 19:19:19",      reason: isMr?"वनस्पति वाढीसाठी":"Balanced vegetative growth" },
        { category:"Irrigation",    product_name: isMr?"ठिबक सिंचन प्रणाली":"Drip System",    reason: isMr?"पाण्याची बचत":"Water efficiency" },
        { category:"Pesticide",     product_name: isMr?"मँकोझेब":"Mancozeb Fungicide",          reason: isMr?"पान करपा प्रतिबंध":"Leaf spot prevention" },
        { category:"Nets & Covers", product_name: isMr?"केळी घड कव्हर":"Banana Bunch Bag",    reason: isMr?"फळ संरक्षण":"Fruit protection" },
        { category:"Fertilizer",    product_name: isMr?"पोटॅशियम नायट्रेट":"Potassium Nitrate", reason: isMr?"फळाचा गोडवा":"Sweetness & size" },
      ],
      onion: [
        { category:"Seeds",         product_name: isMr?"भीमा राज बियाणे":"Bhima Raj Seeds",    reason: isMr?"जास्त उत्पादन":"High yield variety" },
        { category:"Fertilizer",    product_name: isMr?"SSP फॉस्फरस":"SSP Phosphorus",          reason: isMr?"कांदा आकार":"Bulb size improvement" },
        { category:"Pesticide",     product_name: isMr?"थायोमेथोक्साम":"Thiamethoxam",          reason: isMr?"थ्रिप्स नियंत्रण":"Thrips control" },
        { category:"Irrigation",    product_name: isMr?"स्प्रिंकलर किट":"Sprinkler Kit",       reason: isMr?"एकसमान सिंचन":"Uniform irrigation" },
        { category:"Fertilizer",    product_name: isMr?"सल्फर ९०%":"Sulphur 90% WG",           reason: isMr?"साठवण क्षमता":"Shelf life" },
      ],
    };
    const found = Object.keys(MOCKS).find(k => c.includes(k) || k.includes(c));
    if (found) return MOCKS[found];
    return [
      { category:"Fertilizer",    product_name: isMr?"NPK खत":"NPK Fertilizer",      reason: isMr?"संतुलित पोषण":"Balanced nutrition" },
      { category:"Irrigation",    product_name: isMr?"ठिबक सिंचन":"Drip Irrigation",  reason: isMr?"पाण्याचा योग्य वापर":"Water efficiency" },
      { category:"Pesticide",     product_name: isMr?"कीटकनाशक":"Insecticide",        reason: isMr?"किडींचे नियंत्रण":"Pest control" },
      { category:"Fungicide",     product_name: isMr?"बुरशीनाशक":"Fungicide",          reason: isMr?"रोग प्रतिबंध":"Disease prevention" },
      { category:"Nets & Covers", product_name: isMr?"फळ जाळी":"Fruit Net",            reason: isMr?"फळ संरक्षण":"Fruit protection" },
    ];
  });

// ── SUBMIT LEAD (legacy compat — used by landing page contact form) ──────────
export const submitLead = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    name:     z.string().min(2).max(80),
    phone:    z.string().regex(/^[6-9]\d{9}$/),
    district: z.string().optional(),
    message:  z.string().max(500).optional(),
  }))
  .handler(async ({ data }) => {
    let env: Env | null = null;
    try { env = getEnv(); } catch { env = null; }
    const now = new Date().toISOString();
    if (env) {
      try {
        const mongo = getMongo(env);
        await mongo.collection("leads").insertOne({ ...data, createdAt: now });
      } catch { /* fallback: ignore if mongo not configured */ }
    }
    const supportPhone = env?.SUPPORT_PHONE ?? "910000000000";
    const waMsg = encodeURIComponent("नमस्कार! मला GreenGear बद्दल अधिक माहिती हवी आहे.\nनाव: " + data.name + "\nफोन: " + data.phone);
    return { success: true, whatsapp_link: "https://wa.me/" + supportPhone + "?text=" + waMsg };
  });
