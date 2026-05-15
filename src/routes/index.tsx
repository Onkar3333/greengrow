import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { submitLead } from "@/functions";
import { useState, useEffect, useRef } from "react";
import { useI18n } from "@/lib/useI18n";
import { useAuth } from "@/lib/useAuth";
import {
  MessageCircle,
  Menu,
  X,
  Tractor,
  Building2,
  Package,
  Users,
  Warehouse,
  Store,
  BadgePercent,
  Globe,
  Leaf,
  Smartphone,
  ArrowRight,
  ChevronDown,
} from "lucide-react";
import heroImg from "@/assets/hero-farmer.jpg";
import catNets from "@/assets/cat-nets.jpg";
import catFert from "@/assets/cat-fertilizer.jpg";
import catDrip from "@/assets/cat-drip.jpg";
import catPlants from "@/assets/cat-plants.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GreenGear Agro — Direct from Company to Farmer" },
      {
        name: "description",
        content:
          "B2F marketplace connecting fruit farmers directly with agricultural manufacturers. Fruit nets, organic fertilizers, drip irrigation, seeds & plants at factory prices.",
      },
      { property: "og:title", content: "GreenGear Agro — Direct from Company to Farmer" },
      {
        property: "og:description",
        content:
          "Skip the middlemen. Quality farm inputs delivered direct to your farm. Marathi & English support, WhatsApp ordering.",
      },
      { property: "og:image", content: heroImg },
      { name: "theme-color", content: "#0D2B12" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Mukta:wght@400;500;600;700;800&display=swap",
      },
    ],
  }),
  component: Index,
});

/* ─── Design tokens ────────────────────────────────────────────── */
const css = `
  :root {
    --primary:   #6C48F2;
    --secondary: #D946EF;
    --text-dark: #111827;
    --text-gray: #4B5563;
    --bg-white:  #FFFFFF;
    --bg-gray:   #F9FAFB;
    --border:    #E5E7EB;

    --font-display: 'Mukta', system-ui, sans-serif;
    --font-body:    'Mukta', system-ui, sans-serif;
    --font-mono:    'Mukta', system-ui, sans-serif;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: var(--font-body);
    background: var(--bg-white);
    color: var(--text-dark);
    overflow-x: hidden;
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(40px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes slideRight {
    from { transform: scaleX(0); }
    to   { transform: scaleX(1); }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50%       { transform: translateY(-12px) rotate(1deg); }
  }
  @keyframes ping {
    0%, 100% { transform: scale(1); opacity: 1; }
    50%       { transform: scale(1.6); opacity: 0; }
  }
  @keyframes ticker {
    0%   { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  @keyframes countUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes barGrow {
    from { width: 0; }
    to   { width: var(--target-w); }
  }
  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }

  .animate-fade-up   { animation: fadeUp 0.8s ease both; }
  .animate-float     { animation: float 6s ease-in-out infinite; }

  /* nav glass */
  .nav-glass {
    backdrop-filter: blur(20px) saturate(180%);
    -webkit-backdrop-filter: blur(20px) saturate(180%);
    background: rgba(255, 255, 255, 0.9);
    border-bottom: 1px solid var(--border);
  }

  /* hero grain overlay */
  .grain::after {
    content: '';
    position: absolute;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E");
    pointer-events: none;
    z-index: 1;
  }

  /* section rule */
  .eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    font-family: var(--font-body);
    font-size: 13px;
    font-weight: 600;
    text-transform: uppercase;
    color: var(--primary);
  }
  .eyebrow::before {
    content: '';
    display: block;
    width: 32px;
    height: 1px;
    background: var(--primary);
  }

  /* gold shimmer btn */
  .btn-gold {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 16px 36px;
    background: var(--primary);
    color: white;
    font-family: var(--font-body);
    font-weight: 600;
    font-size: 14px;
    border: none;
    border-radius: 100px;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
    overflow: hidden;
    text-decoration: none;
    box-shadow: 0 4px 14px rgba(108, 72, 242, 0.3);
  }
  .btn-gold::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.35) 50%, transparent 60%);
    background-size: 200%;
    opacity: 0;
    transition: opacity 0.2s;
  }
  .btn-gold:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(108, 72, 242, 0.4); }
  .btn-gold:hover::after { opacity: 1; animation: shimmer 0.6s ease; }

  /* outline ghost btn */
  .btn-ghost {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 15px 32px;
    background: white;
    color: var(--text-dark);
    font-family: var(--font-body);
    font-weight: 500;
    font-size: 14px;
    border: 1px solid var(--border);
    border-radius: 100px;
    cursor: pointer;
    transition: background 0.2s, border-color 0.2s;
    text-decoration: none;
  }
  .btn-ghost:hover { background: var(--bg-gray); border-color: var(--text-gray); }

  /* card hover lift */
  .card-lift {
    transition: transform 0.35s cubic-bezier(0.25,0.46,0.45,0.94), box-shadow 0.35s;
  }
  .card-lift:hover {
    transform: translateY(-8px);
    box-shadow: 0 32px 64px rgba(13,43,18,0.18);
  }

  /* ticker tape */
  .ticker-wrap { overflow: hidden; }
  .ticker-inner {
    display: flex;
    width: max-content;
    animation: ticker 30s linear infinite;
  }

  /* scroll indicator */
  .scroll-indicator {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    font-family: var(--font-mono);
    font-size: 9px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--text-muted);
    animation: fadeIn 1.5s 1.5s both;
  }
  .scroll-line {
    width: 1px;
    height: 64px;
    background: linear-gradient(to bottom, var(--text-muted), transparent);
    animation: slideRight 1.5s 1.5s both;
  }

  /* form inputs */
  .form-input {
    width: 100%;
    padding: 14px 18px;
    background: var(--bg-gray);
    border: 1px solid var(--border);
    border-radius: 10px;
    color: var(--text-dark);
    font-family: var(--font-body);
    font-size: 14px;
    transition: border-color 0.2s, background 0.2s;
    outline: none;
  }
  .form-input::placeholder { color: var(--text-muted); }
  .form-input:focus {
    border-color: var(--primary);
    background: var(--bg-white);
  }

  /* product pill */
  .product-pill {
    padding: 8px 20px;
    border: 1px solid var(--border);
    border-radius: 100px;
    font-size: 13px;
    font-weight: 500;
    color: var(--text-dark);
    background: var(--bg-white);
    cursor: pointer;
    transition: all 0.2s;
  }
  .product-pill:hover {
    background: var(--primary);
    color: white;
    border-color: var(--primary);
  }

  /* feature card accent */
  .feature-card {
    padding: 40px 36px;
    background: var(--bg-white);
    border: 1px solid var(--border);
    position: relative;
    overflow: hidden;
    transition: border-color 0.3s;
  }
  .feature-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
    background: linear-gradient(to right, var(--primary), var(--secondary));
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.4s cubic-bezier(0.25,0.46,0.45,0.94);
  }
  .feature-card:hover::before { transform: scaleX(1); }
  .feature-card:hover { border-color: rgba(108,72,242,0.3); }

  /* big stat number */
  .stat-number {
    font-family: var(--font-display);
    font-size: clamp(40px, 6vw, 64px);
    font-weight: 800;
    line-height: 0.9;
    color: var(--primary);
    letter-spacing: -0.02em;
  }

  /* supply chain row */
  .chain-row {
    display: flex;
    align-items: center;
    padding: 20px 28px;
    border-bottom: 1px solid var(--border);
    transition: background 0.2s;
  }
  .chain-row:hover { background: var(--bg-white); }

  /* whatsapp pulse */
  .wa-pulse {
    position: relative;
  }
  .wa-pulse::before {
    content: '';
    position: absolute;
    inset: -4px;
    border-radius: 100px;
    background: rgba(108,72,242,0.3);
    animation: ping 2s ease-in-out infinite;
  }

  @media (max-width: 768px) {
    .hide-mobile { display: none !important; }
    .show-mobile { display: flex !important; }
  }
  @media (min-width: 769px) {
    .show-mobile { display: none !important; }
  }
`;

/* ─── FadeIn on scroll ─────────────────────────────────────────── */
function FadeIn({
  children,
  delay = 0,
  className = "",
  style = {},
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); io.unobserve(e.target); } },
      { threshold: 0.08 }
    );
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={className}
      style={{
        transition: `opacity 0.9s ease ${delay}ms, transform 0.9s cubic-bezier(0.25,0.46,0.45,0.94) ${delay}ms`,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(48px)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ─── Animated counter ─────────────────────────────────────────── */
function Counter({ end, suffix = "", prefix = "" }: { end: number; suffix?: string; prefix?: string }) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setStarted(true); io.unobserve(e.target); } }, { threshold: 0.3 });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    if (!started) return;
    let start: number | null = null;
    const dur = 2200;
    const step = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / dur, 1);
      const ease = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      setCount(Math.floor(ease * end));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [started, end]);
  return <span ref={ref}>{prefix}{count}{suffix}</span>;
}

/* ─── Data ─────────────────────────────────────────────────────── */
const categories = [
  { img: catNets,   key: "Fruit Nets & Covers",     meta: "UV Protected · Durable",       tag: "Best Seller" },
  { img: catFert,   key: "Organic Fertilizers",      meta: "Soil Nutrition · Certified",   tag: "Eco Choice" },
  { img: catDrip,   key: "Drip Irrigation",          meta: "Water Efficiency · Precision", tag: "Save 60%" },
  { img: catPlants, key: "Banana & Onion Plants",    meta: "High-yield Saplings",          tag: "New Harvest" },
];

const products = ["Fruit Nets","Fruit Covers","Organic Fertilizers","Seeds","Banana Plants","Onion Plants","Spray Products","Drip Irrigation","Agricultural Tools"];

const targetUsers = [
  { name: "Fruit Farmers",         desc: "Primary buyers — always free.",    icon: Tractor  },
  { name: "Agriculture Companies", desc: "List & sell directly.",            icon: Building2 },
  { name: "Farm Input Suppliers",  desc: "Expand your digital reach.",       icon: Package  },
  { name: "Agricultural Agencies", desc: "Bulk & regional orders.",          icon: Users    },
  { name: "Warehouses & Distrib.", desc: "Last-mile delivery partners.",     icon: Warehouse },
];

const features = [
  { key: "Direct Marketplace",   icon: Store,        desc: "Buy straight from the manufacturer — zero agents, zero markup." },
  { key: "Affordable Pricing",   icon: BadgePercent, desc: "Save up to 40% on every order compared to local retailers."    },
  { key: "Marathi + English",    icon: Globe,        desc: "Full Marathi interface so every farmer can use it confidently." },
  { key: "Crop-based Suggestions", icon: Leaf,       desc: "AI-powered product recommendations matched to your crop type." },
  { key: "WhatsApp Ordering",    icon: MessageCircle,desc: "Place orders without an app — just send a WhatsApp message."   },
  { key: "Mobile-first",         icon: Smartphone,   desc: "Built for the smartphone in your pocket. Fast, light, offline-ready." },
];

/* ─── Enquiry form ─────────────────────────────────────────────── */
function EnquiryForm({ productId }: { productId?: number }) {
  const { t } = useI18n();
  const [form, setForm] = useState({ name: "", phone: "", district: "", crop: "", message: "" });
  const [success, setSuccess] = useState(false);
  const { mutate, isPending, error } = useMutation({
    mutationFn: () => submitLead({ data: { name: form.name, phone: form.phone, district: form.district, message: form.message } }),
    onSuccess: () => setSuccess(true),
  });

  if (success) {
    return (
      <div style={{ textAlign: "center", padding: "48px 24px" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🌿</div>
        <p style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700, color: "var(--primary)", marginBottom: 8 }}>
          {t("form.requestReceived")}
        </p>
        <p style={{ color: "var(--text-gray)", fontSize: 14, fontFamily: "var(--font-mono)", letterSpacing: "0.05em" }}>
          {t("form.weCallYouBack")}
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); mutate(); }}
      style={{ display: "flex", flexDirection: "column", gap: 12 }}
    >
      <input required placeholder={t("form.namePlaceholder")} value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })} className="form-input" />
      <input required type="tel" placeholder={t("form.phonePlaceholder")} value={form.phone}
        onChange={(e) => setForm({ ...form, phone: e.target.value })} className="form-input" />
      <input placeholder={t("form.districtPlaceholder")} value={form.district}
        onChange={(e) => setForm({ ...form, district: e.target.value })} className="form-input" />
      <input placeholder={t("form.cropPlaceholder")} value={form.crop}
        onChange={(e) => setForm({ ...form, crop: e.target.value })} className="form-input" />
      {error && <p style={{ color: "#f87171", fontSize: 12, fontFamily: "var(--font-mono)" }}>{(error as Error).message}</p>}
      <button
        type="submit"
        disabled={isPending}
        className="btn-gold"
        style={{ width: "100%", justifyContent: "center", marginTop: 8, opacity: isPending ? 0.6 : 1 }}
      >
        {isPending ? "Sending…" : t("form.getQuote")}
        {!isPending && <ArrowRight size={16} />}
      </button>
    </form>
  );
}

/* ─── Main page ────────────────────────────────────────────────── */
function Index() {
  const { t, lang, setLang } = useI18n();
  const { isLogged, user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  const dashHref = user?.role === "supplier" ? "/dashboard/supplier" : "/dashboard/farmer";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) setActiveSection(e.target.id); }),
      { threshold: 0.4 }
    );
    document.querySelectorAll("section[id]").forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  const navLinks = [
    { label: t("nav.products"),       href: "/products" },
    { label: t("nav.recommendations"), href: "/recommendations" },
    { label: t("nav.supply"),          href: "#supply" },
    { label: t("nav.features"),        href: "#features" },
    { label: t("nav.partners"),        href: "#partners" },
  ];

  const tickerItems = [
    t("productsList.Fruit Nets"),
    t("productsList.Organic Fertilizers"),
    t("productsList.Drip Irrigation"),
    t("productsList.Seeds"),
    t("productsList.Spray Products"),
    t("productsList.Agricultural Tools"),
    t("productsList.Banana Plants"),
    t("productsList.Onion Plants"),
  ];

  return (
    <div style={{ minHeight: "100vh", background: "var(--white)", overflowX: "hidden" }}>
      <style>{css}</style>

      {/* ── Nav ───────────────────────────────────── */}
      <nav
        className={scrolled ? "nav-glass" : ""}
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: scrolled ? undefined : "var(--bg-white)",
          transition: "background 0.4s",
        }}
      >
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 72 }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <img src="/logo.png" alt="GreenGear Agro" style={{ height: 44, width: "auto", objectFit: "contain" }} />
            <div>
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 20, color: "var(--text-dark)", letterSpacing: "-0.02em" }}>
                GREENGEAR
              </span>
              <span style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--primary)", letterSpacing: "0.05em", marginTop: -2 }}>
                {t("nav.logoSubtitle")}
              </span>
            </div>
          </div>

          {/* Desktop links */}
          <div className="hide-mobile" style={{ display: "flex", gap: 36, alignItems: "center" }}>
            {navLinks.map((l) => (
              <a key={l.href} href={l.href}
                style={{
                  fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase",
                  color: activeSection === l.href.slice(1) ? "var(--primary)" : "var(--text-gray)",
                  textDecoration: "none", transition: "color 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--primary)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = activeSection === l.href.slice(1) ? "var(--primary)" : "var(--text-gray)")}
              >
                {l.label}
              </a>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button
              onClick={() => setLang(lang === "en" ? "mr" : "en")}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                background: "var(--bg-gray)", border: "1px solid var(--border)",
                color: "var(--text-dark)", padding: "8px 12px", borderRadius: 100, cursor: "pointer",
                fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.08em", transition: "all 0.2s"
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "var(--border)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "var(--bg-gray)"; }}
            >
              <Globe size={14} style={{ opacity: 0.7 }} />
              {lang === "en" ? "मराठी" : "English"}
            </button>
            <a href="https://wa.me/910000000000" className="btn-gold hide-mobile" style={{ padding: "10px 22px", fontSize: 11 }}>
              <MessageCircle size={14} />
              WhatsApp
              <span className="wa-pulse" style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
            </a>

            {/* Auth Button */}
            {isLogged && user ? (
              <div style={{ display:"flex", alignItems:"center", gap:8 }} className="hide-mobile">
                <a href={dashHref} className="btn-ghost" style={{ padding:"8px 16px", color:"var(--primary)", borderColor:"var(--primary)" }}>
                  {user.name.split(" ")[0]} Dashboard
                </a>
                <button onClick={logout} className="btn-ghost" style={{ padding:"8px 12px" }}>
                  {lang === "mr" ? "बाहेर पडा" : "Logout"}
                </button>
              </div>
            ) : (
              <a href="/auth/login" className="btn-ghost hide-mobile" style={{ padding:"10px 22px", color:"var(--primary)", borderColor:"var(--primary)" }}>
                {lang === "mr" ? "लॉगिन" : "Login"}
              </a>
            )}

            <button
              className="show-mobile"
              onClick={() => setMenuOpen(!menuOpen)}
              style={{ background: "none", border: "none", color: "var(--text-dark)", cursor: "pointer", padding: 8 }}
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div style={{ background: "var(--bg-white)", borderTop: "1px solid var(--border)", padding: "20px 32px 28px", display: "flex", flexDirection: "column", gap: 20 }}>
            {navLinks.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)}
                style={{ fontFamily: "var(--font-mono)", fontSize: 12, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--text-gray)", textDecoration: "none" }}>
                {l.label}
              </a>
            ))}
            <a href="https://wa.me/910000000000" className="btn-gold" style={{ width: "fit-content", fontSize: 11 }}>
              <MessageCircle size={14} /> {t("nav.whatsappSupport")}
            </a>
            {isLogged && user ? (
              <>
                <a href={dashHref} className="btn-ghost" style={{ width: "fit-content", color:"var(--primary)", borderColor:"var(--primary)" }}>Dashboard</a>
                <button onClick={logout} className="btn-ghost" style={{ width: "fit-content" }}>{lang === "mr" ? "बाहेर पडा" : "Logout"}</button>
              </>
            ) : (
              <a href="/auth/login" className="btn-ghost" style={{ width: "fit-content", color:"var(--primary)", borderColor:"var(--primary)" }}>{lang === "mr" ? "लॉगिन" : "Login"}</a>
            )}
          </div>
        )}
      </nav>

      <main>
        {/* ── HERO ──────────────────────────────────── */}
        <section
          className="grain"
          style={{
            position: "relative",
            background: "var(--bg-white)",
            minHeight: "100svh",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* bg texture circles */}
          <div style={{ position: "absolute", top: "-20%", right: "-10%", width: 700, height: 700, borderRadius: "50%", background: "radial-gradient(circle, rgba(108,72,242,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: "10%", left: "-5%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(217,70,239,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />

          <div style={{ maxWidth: 1280, margin: "0 auto", padding: "80px 32px 60px", flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center", position: "relative", zIndex: 2 }}>
            {/* Left */}
            <div>
              {/* badges */}
              <div className="animate-fade-up" style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 32, animationDelay: "0ms" }}>
                {[t("hero.badgeA"), t("hero.badgeB"), t("hero.badgeC")].map((b) => (
                  <span key={b} style={{ padding: "5px 14px", border: "1px solid var(--border)", borderRadius: 100, fontSize: 11, fontFamily: "var(--font-mono)", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-gray)", background: "var(--bg-gray)" }}>
                    {b}
                  </span>
                ))}
              </div>

              {/* headline */}
              <h1
                className="animate-fade-up"
                style={{
                  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(42px,6vw,72px)",
                  lineHeight: 1.1, color: "var(--text-dark)",
                  marginBottom: 8, animationDelay: "120ms",
                }}
              >
                {t("hero.line1")}<br />
                <span style={{ background: "linear-gradient(to right, var(--primary), var(--secondary))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{t("hero.line2")}</span>
              </h1>

              <p className="animate-fade-up" style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--primary)", letterSpacing: "0.1em", marginBottom: 24, animationDelay: "200ms" }}>
                {t("hero.mrLine")}
              </p>

              <p className="animate-fade-up" style={{ fontSize: "clamp(16px,2vw,20px)", color: "var(--text-gray)", maxWidth: "42ch", lineHeight: 1.65, marginBottom: 40, animationDelay: "240ms" }}>
                {t("hero.lead")}
              </p>

              <div className="animate-fade-up" style={{ display: "flex", flexWrap: "wrap", gap: 14, marginBottom: 52, animationDelay: "300ms" }}>
                <a href="/products" className="btn-gold">
                  {t("hero.browse")} <ArrowRight size={16} />
                </a>
                <a href="/auth/signup" className="btn-ghost">
                  {lang === "mr" ? "नवीन खाते तयार करा" : "Register / Sign Up"}
                </a>
              </div>

              {/* trust tags */}
              <div className="animate-fade-up" style={{ display: "flex", flexWrap: "wrap", gap: 28, animationDelay: "380ms" }}>
                {[t("hero.tagA"), t("hero.tagB"), t("hero.tagC")].map((tag) => (
                  <span key={tag} style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--primary)", display: "inline-block" }} />
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Right — hero image */}
            <div className="animate-float hide-mobile" style={{ position: "relative", animationDelay: "0.5s" }}>
              {/* rotating badge */}
              <div style={{
                position: "absolute", top: -24, right: -24, zIndex: 10,
                background: "var(--primary)", color: "white", borderRadius: "50%",
                width: 96, height: 96, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center",
                fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase",
                lineHeight: 1.3, boxShadow: "0 12px 40px rgba(108,72,242,0.4)",
              }}>
                {t("hero.newBadge")}
              </div>

              {/* decorative frame */}
              <div style={{
                position: "absolute", inset: -16, border: "1px solid var(--border)",
                borderRadius: 24, pointerEvents: "none",
              }} />

              <img
                src={heroImg}
                alt="Indian fruit farmer inspecting orchard netting"
                style={{
                  width: "100%", aspectRatio: "4/5", objectFit: "cover",
                  borderRadius: 16, display: "block",
                  boxShadow: "0 40px 80px rgba(0,0,0,0.1)",
                }}
              />

              {/* floating info pill */}
              <div style={{
                position: "absolute", bottom: 32, left: -32,
                background: "var(--bg-white)", backdropFilter: "blur(16px)",
                border: "1px solid var(--border)", borderRadius: 12,
                padding: "16px 24px", boxShadow: "0 20px 40px rgba(0,0,0,0.05)"
              }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 900, color: "var(--primary)" }}>40%</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-gray)", letterSpacing: "0.12em", textTransform: "uppercase", marginTop: 2 }}>{t("hero.averageSavings")}</div>
              </div>
            </div>
          </div>

          {/* scroll cue */}
          <div style={{ display: "flex", justifyContent: "center", paddingBottom: 40, position: "relative", zIndex: 2 }}>
            <div className="scroll-indicator">
              <div className="scroll-line" />
              <span>{t("hero.scroll")}</span>
              <ChevronDown size={12} style={{ opacity: 0.5 }} />
            </div>
          </div>
        </section>

        {/* ── TICKER ─────────────────────────────────── */}
        <div style={{ background: "var(--bg-white)", padding: "14px 0", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", overflow: "hidden" }}>
          <div className="ticker-wrap">
            <div className="ticker-inner">
              {[...tickerItems, ...tickerItems].map((item, i) => (
                <span key={i} style={{ padding: "0 32px", fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--text-gray)", whiteSpace: "nowrap" }}>
                  <span style={{ color: "var(--primary)", marginRight: 16 }}>✦</span>
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>


        {/* ── SUPPLY CHAIN ───────────────────────────── */}
        <FadeIn>
          <section id="supply" style={{ background: "var(--bg-gray)", padding: "120px 32px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, right: 0, width: 600, height: 600, background: "radial-gradient(circle, rgba(108,72,242,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />
            <div style={{ maxWidth: 1280, margin: "0 auto", position: "relative", zIndex: 1 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "start" }}>

                {/* Left: old vs new */}
                <div>
                  <div className="eyebrow" style={{ marginBottom: 24 }}>{t("sections.theProblem")}</div>
                  <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(28px,4vw,48px)", color: "var(--text-dark)", lineHeight: 1.2, marginBottom: 48 }}>
                    {t("sections.middlemenCost")}<br /><em style={{ color: "var(--primary)", fontStyle: "italic" }}>{t("sections.40PercentMore")}</em>
                  </h2>

                  {/* Old chain */}
                  <div style={{ marginBottom: 40 }}>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 16 }}>{t("supplyChain.oldRoute")}</div>
                    {[
                      { name: "manufacturingPlant", cost: "₹", accent: false },
                      { name: "nationalAgent",       cost: "+15%", accent: true },
                      { name: "regionalDealer",      cost: "+10%", accent: true },
                      { name: "localRetailer",       cost: "+15%", accent: true },
                      { name: "farmerCost",          cost: "140%", accent: false, bold: true },
                    ].map((row) => (
                      <div key={row.name} className="chain-row" style={row.bold ? { background: "rgba(239,64,64,0.08)", borderColor: "rgba(239,64,64,0.15)" } : {}}>
                        <span style={{ flex: 1, fontSize: 15, color: row.bold ? "var(--text-dark)" : "var(--text-gray)", fontWeight: row.bold ? 700 : 400, fontFamily: row.bold ? "var(--font-display)" : "var(--font-body)" }}>
                          {t(`supplyChain.${row.name}`)}
                        </span>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 600, color: row.accent ? "#f87171" : row.bold ? "#f87171" : "var(--text-muted)" }}>
                          {row.cost}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: GreenGear way */}
                <div style={{ paddingTop: 120 }}>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--primary)", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 16 }}>{t("supplyChain.greenGearWay")}</div>
                  {[
                    { name: "manufacturingPlant",      cost: "₹",    accent: false },
                    { name: "greenGearMarketplace",    cost: "+5%",  accent: false, highlight: true },
                    { name: "logisticsHub",            cost: "+3%",  accent: false },
                    { name: "farmerCost",              cost: "108%", accent: false, bold: true, win: true },
                  ].map((row) => (
                    <div key={row.name} className="chain-row"
                      style={{
                        borderColor: row.highlight ? "rgba(108,72,242,0.3)" : undefined,
                        background: row.win ? "rgba(108,72,242,0.1)" : row.highlight ? "rgba(108,72,242,0.04)" : undefined,
                      }}
                    >
                      <span style={{ flex: 1, fontSize: 15, color: row.bold ? "var(--text-dark)" : row.highlight ? "var(--primary)" : "var(--text-gray)", fontWeight: row.bold ? 700 : 400, fontFamily: row.bold ? "var(--font-display)" : "var(--font-body)" }}>
                        {t(`supplyChain.${row.name}`)}
                      </span>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 600, color: row.win ? "var(--primary)" : row.highlight ? "var(--primary)" : "var(--text-muted)" }}>
                        {row.cost}
                      </span>
                    </div>
                  ))}

                  <div style={{ marginTop: 36, padding: 28, border: "1px solid rgba(108,72,242,0.3)", borderRadius: 8, background: "rgba(108,72,242,0.05)" }}>
                    <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 48, color: "var(--primary)", lineHeight: 1 }}>{t("supplyChain.save32")}</div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-gray)", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 8 }}>{t("supplyChain.saveDesc")}</div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </FadeIn>

        {/* ── PRODUCTS ───────────────────────────────── */}
        <FadeIn>
          <section id="products" style={{ padding: "120px 32px", background: "var(--bg-white)" }}>
            <div style={{ maxWidth: 1280, margin: "0 auto" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 64, flexWrap: "wrap", gap: 24 }}>
                <div>
                  <div className="eyebrow" style={{ color: "var(--primary)", marginBottom: 20 }}>{t("sections.catalogue")}</div>
                  <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(28px,4vw,48px)", color: "var(--text-dark)", lineHeight: 1.2 }}>
                    {t("sections.productsTitle")}
                  </h2>
                </div>
                <a href="https://wa.me/910000000000"
                  className="btn-gold"
                  style={{ background: "var(--text-dark)", color: "white", boxShadow: "none" }}
                >
                  <MessageCircle size={16} /> {t("cta.orderViaWhatsApp")}
                </a>
              </div>

              {/* Category grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 24, marginBottom: 64 }}>
                {categories.map((cat, i) => (
                  <FadeIn key={cat.key} delay={i * 80}>
                    <div className="card-lift" style={{ position: "relative", borderRadius: 12, overflow: "hidden", background: "var(--forest)", cursor: "pointer" }}>
                      <img src={cat.img} alt={cat.key}
                        style={{ width: "100%", aspectRatio: "1/1", objectFit: "cover", display: "block", opacity: 0.8 }}
                      />
                      {/* tag */}
                      <div style={{
                        position: "absolute", top: 16, left: 16,
                        padding: "4px 12px", background: "var(--primary)", color: "white",
                        borderRadius: 100, fontSize: 10, fontFamily: "var(--font-mono)", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase",
                      }}>
                        {cat.tag}
                      </div>
                      {/* bottom overlay */}
                      <div style={{
                        position: "absolute", bottom: 0, left: 0, right: 0,
                        background: "linear-gradient(to top, rgba(13,43,18,0.95) 0%, transparent 100%)",
                        padding: "48px 24px 24px",
                      }}>
                        <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20, color: "var(--cream)", marginBottom: 4 }}>
                          {t(`categories.${cat.key}`)}
                        </div>
                        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--sage)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                          {cat.meta}
                        </div>
                      </div>
                    </div>
                  </FadeIn>
                ))}
              </div>

              {/* product pills */}
              <div style={{ borderTop: "1px solid var(--border)", paddingTop: 48 }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 24 }}>
                  {t("sections.catalogTitle")}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                  {products.map((p) => (
                    <span key={p} className="product-pill">{t(`productsList.${p}`)}</span>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </FadeIn>

        {/* ── FOR WHOM ───────────────────────────────── */}
        <FadeIn>
          <section id="users" style={{ background: "var(--bg-gray)", padding: "120px 32px" }}>
            <div style={{ maxWidth: 1280, margin: "0 auto" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 80, alignItems: "start" }}>
                <div>
                  <div className="eyebrow" style={{ color: "var(--primary)", marginBottom: 24 }}>{t("sections.builtFor")}</div>
                  <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(28px,4vw,48px)", color: "var(--text-dark)", lineHeight: 1.2 }}>
                    {t("sections.everyone")}<br /><em style={{ color: "var(--primary)", fontStyle: "italic" }}>{t("sections.inTheField")}</em>
                  </h2>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, background: "var(--border)", borderRadius: 12, overflow: "hidden" }}>
                  {targetUsers.map((u, i) => {
                    const Icon = u.icon;
                    return (
                      <div key={u.name}
                        style={{
                          background: "var(--bg-white)", padding: "28px 28px",
                          transition: "background 0.2s, color 0.2s",
                          cursor: "default",
                        }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = "var(--primary)"; (e.currentTarget as HTMLDivElement).style.color = "white"; ((e.currentTarget as HTMLDivElement).querySelector('.icon-wrapper') as HTMLElement).style.background = "rgba(255,255,255,0.2)"; ((e.currentTarget as HTMLDivElement).querySelector('.icon-svg') as HTMLElement).style.color = "white"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = "var(--bg-white)"; (e.currentTarget as HTMLDivElement).style.color = "var(--text-dark)"; ((e.currentTarget as HTMLDivElement).querySelector('.icon-wrapper') as HTMLElement).style.background = "rgba(108,72,242,0.1)"; ((e.currentTarget as HTMLDivElement).querySelector('.icon-svg') as HTMLElement).style.color = "var(--primary)"; }}
                      >
                        <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                          <div className="icon-wrapper" style={{ background: "rgba(108,72,242,0.1)", borderRadius: 8, padding: 10, flexShrink: 0, transition: "background 0.2s" }}>
                            <Icon size={20} className="icon-svg" style={{ color: "var(--primary)", display: "block", transition: "color 0.2s" }} />
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{t(`targets.${u.name}`)}</div>
                            <div style={{ fontSize: 12, color: "var(--text-gray)", opacity: 0.8 }}>{t(`targets.${u.name}_desc`)}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ marginTop: 64, textAlign: "center" }}>
                <a href="https://wa.me/910000000000" className="btn-gold" style={{ fontSize: 13 }}>
                  <MessageCircle size={16} /> {t("cta.joinFarmers")} <ArrowRight size={16} />
                </a>
              </div>
            </div>
          </section>
        </FadeIn>

        {/* ── FEATURES ───────────────────────────────── */}
        <FadeIn>
          <section id="features" style={{ padding: "120px 32px", background: "var(--bg-white)" }}>
            <div style={{ maxWidth: 1280, margin: "0 auto" }}>
              <div style={{ textAlign: "center", marginBottom: 80 }}>
                <div className="eyebrow" style={{ color: "var(--primary)", marginBottom: 24, justifyContent: "center" }}>{t("sections.platform")}</div>
                <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(28px,4vw,48px)", color: "var(--text-dark)", lineHeight: 1.2 }}>
                  {t("sections.whyTitle")}
                </h2>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 2, background: "var(--border)", borderRadius: 12, overflow: "hidden" }}>
                {features.map((f, i) => {
                  const Icon = f.icon;
                  return (
                    <FadeIn key={f.key} delay={i * 60}>
                      <div className="feature-card" style={{ background: "var(--bg-white)" }}>
                        <div style={{
                          width: 48, height: 48, borderRadius: 10,
                          background: "rgba(108,72,242,0.1)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          marginBottom: 24,
                        }}>
                          <Icon size={22} style={{ color: "var(--primary)" }} />
                        </div>
                        <div style={{ fontWeight: 700, fontSize: 16, color: "var(--text-dark)", marginBottom: 12 }}>
                          {t(`features.${f.key}`)}
                        </div>
                        <div style={{ fontSize: 14, color: "var(--text-gray)", lineHeight: 1.65 }}>
                          {t(`features.${f.key}_desc`)}
                        </div>
                      </div>
                    </FadeIn>
                  );
                })}
              </div>
            </div>
          </section>
        </FadeIn>

        {/* ── PARTNERS ───────────────────────────────── */}
        <FadeIn>
          <section id="partners" style={{ background: "var(--bg-gray)", padding: "120px 32px" }}>
            <div style={{ maxWidth: 1280, margin: "0 auto" }}>
              <div style={{ textAlign: "center", marginBottom: 80 }}>
                <div className="eyebrow" style={{ color: "var(--primary)", marginBottom: 24, justifyContent: "center" }}>{t("sections.forManufacturers")}</div>
                <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(28px,4vw,48px)", color: "var(--text-dark)", lineHeight: 1.2 }}>
                  {t("sections.partnersTitle")}
                </h2>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--text-muted)", marginTop: 20 }}>
                  {t("sections.partnersSubtitle")}
                </p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24, marginBottom: 56 }}>
                {[
                  { icon: "🎯", titleKey: "directFarmerAccess", descKey: "directFarmerAccessDesc" },
                  { icon: "📋", titleKey: "subscriptionListing", descKey: "subscriptionListingDesc" },
                  { icon: "📊", titleKey: "analyticsDashboard", descKey: "analyticsDashboardDesc" },
                ].map((card) => (
                  <div key={card.titleKey} className="card-lift" style={{
                    background: "var(--bg-white)", padding: "44px 36px", borderRadius: 12,
                    border: "1px solid var(--border)",
                  }}>
                    <div style={{ fontSize: 36, marginBottom: 20 }}>{card.icon}</div>
                    <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20, color: "var(--text-dark)", marginBottom: 12 }}>
                      {t(`sections.${card.titleKey}`)}
                    </div>
                    <div style={{ fontSize: 14, color: "var(--text-gray)", lineHeight: 1.7 }}>{t(`sections.${card.descKey}`)}</div>
                  </div>
                ))}
              </div>

              <div style={{ textAlign: "center" }}>
                <a href="#contact" className="btn-gold">
                  {t("sections.listProducts")} <ArrowRight size={16} />
                </a>
              </div>
            </div>
          </section>
        </FadeIn>

        {/* ── CTA / CONTACT ──────────────────────────── */}
        <FadeIn>
          <section style={{ background: "var(--bg-white)", padding: "120px 32px", position: "relative", overflow: "hidden" }} id="contact">
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: "linear-gradient(to right, var(--primary), var(--secondary))" }} />

            <div style={{ maxWidth: 1280, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center", position: "relative", zIndex: 1 }}>
              <div>
                <div className="eyebrow" style={{ marginBottom: 28, color: "var(--primary)" }}>{t("sections.getStarted")}</div>
                <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(32px,5vw,56px)", color: "var(--text-dark)", lineHeight: 1.1, marginBottom: 28 }}>
                  {t("sections.startSaving")}<br /><span style={{ background: "linear-gradient(to right, var(--primary), var(--secondary))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{t("sections.thisSeason")}</span>
                </h2>
                <p style={{ fontSize: 16, color: "var(--text-gray)", marginBottom: 44, lineHeight: 1.7 }}>
                  {t("sections.alreadyTrusted")}
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginBottom: 52 }}>
                  <a href="https://wa.me/910000000000" className="btn-gold">
                    <MessageCircle size={16} /> {t("cta.orderOnWhatsApp")}
                  </a>
                  <a href="/products" className="btn-ghost">{t("cta.seeAllProducts")}</a>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 24 }}>
                  {(["noRegistration", "doorstepDelivery", "qualityGuaranteed"] as const).map((key) => (
                    <span key={key} style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ width: 4, height: 4, background: "var(--primary)", borderRadius: "50%", display: "inline-block" }} />
                      {t(`cta.${key}`)}
                    </span>
                  ))}
                </div>
              </div>

              {/* Form card */}
              <div style={{
                background: "var(--bg-white)",
                border: "1px solid var(--border)", borderRadius: 16,
                padding: "48px 44px", boxShadow: "0 20px 40px rgba(0,0,0,0.05)"
              }}>
                <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 28, color: "var(--text-dark)", marginBottom: 8 }}>
                  {t("form.getAQuote")}
                </h3>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 32 }}>
                  {t("form.weCallYouBack")}
                </p>
                <EnquiryForm />
              </div>
            </div>
          </section>
        </FadeIn>
      </main>

      {/* ── FOOTER ─────────────────────────────────── */}
      <footer style={{ background: "var(--bg-gray)", padding: "80px 32px 40px", borderTop: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1.5fr", gap: 64, marginBottom: 64 }}>
          {/* brand */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <img src="/logo.png" alt="GreenGear Agro" style={{ height: 40, width: "auto", objectFit: "contain" }} />
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 24, color: "var(--text-dark)" }}>GREENGEAR</span>
            </div>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-gray)", lineHeight: 1.8 }}>
              {t("footer.tagline1")}
            </p>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)", lineHeight: 1.8, marginTop: 8 }}>
              {t("footer.tagline2")}
            </p>
          </div>

          {[
            { titleKey: "marketplace", links: [{ labelKey: "seedsSprays", href: "#products" }, { labelKey: "fruitCovers", href: "#products" }, { labelKey: "agriTools", href: "#products" }] },
            { titleKey: "company", links: [{ labelKey: "forFarmers", href: "#users" }, { labelKey: "supplyChain", href: "#supply" }, { labelKey: "partnerWithUs", href: "#partners" }] },
            { titleKey: "contact", links: [{ labelKey: "whatsappNum", href: "https://wa.me/910000000000" }, { labelKey: "email", href: "mailto:info@greengear.agro" }, { labelKey: "address", href: "#" }] },
          ].map((col) => (
            <div key={col.titleKey}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 24, paddingBottom: 16, borderBottom: "1px solid var(--border)" }}>
                {t(`footer.${col.titleKey}`)}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {col.links.map((l) => (
                  <a key={l.labelKey} href={l.href}
                    style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-gray)", textDecoration: "none", transition: "color 0.2s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "var(--primary)")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-gray)")}
                  >
                    {t(`footer.${l.labelKey}`)}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{ maxWidth: 1280, margin: "0 auto", paddingTop: 32, borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.08em" }}>
            {t("footer.designedFor")}
          </span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.08em" }}>
            {t("footer.copyright")}
          </span>
        </div>
      </footer>

      {/* ── Floating WhatsApp ───────────────────────── */}
      <div style={{ position: "fixed", bottom: 28, right: 28, zIndex: 200 }}>
        <div style={{ position: "relative" }}>
          <div style={{
            position: "absolute", bottom: "100%", right: 0,
            marginBottom: 12, background: "var(--text-dark)", color: "white",
            fontSize: 11, fontFamily: "var(--font-mono)", padding: "8px 14px",
            borderRadius: 6,
            whiteSpace: "nowrap", pointerEvents: "none",
            opacity: 0, transition: "opacity 0.2s",
          }} className="wa-tooltip">
            {t("wa.chatWithUs")}
          </div>
          <a
            href="https://wa.me/910000000000"
            aria-label="Order Now on WhatsApp"
            className="btn-gold wa-pulse"
            style={{ padding: "14px 28px", borderRadius: 100, fontSize: 13, boxShadow: "0 16px 48px rgba(108,72,242,0.4)" }}
            onMouseEnter={(e) => {
              const tooltip = e.currentTarget.previousElementSibling as HTMLElement;
              if (tooltip) tooltip.style.opacity = "1";
            }}
            onMouseLeave={(e) => {
              const tooltip = e.currentTarget.previousElementSibling as HTMLElement;
              if (tooltip) tooltip.style.opacity = "0";
            }}
          >
            <MessageCircle size={18} />
            {t("wa.orderNow")}
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", display: "inline-block", boxShadow: "0 0 0 3px rgba(34,197,94,0.25)" }} />
          </a>
        </div>
      </div>
    </div>
  );
}