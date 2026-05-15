import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  useRouterState,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { I18nProvider } from "@/lib/i18n";
import { useI18n } from "@/lib/useI18n";
import { AuthProvider, useAuth } from "@/lib/useAuth";
import { CartProvider, useCart } from "@/lib/useCart";
import { CartDrawer } from "@/components/CartDrawer";
import { useState, useEffect } from "react";
import { Menu, X, Globe, MessageCircle, ChevronLeft, Home, ShoppingBag, Leaf, Link2 } from "lucide-react";
import logoUrl from "/logo.png";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "GreenGear Agro - Direct to Farm" },
      { name: "description", content: "Buy agricultural products directly from manufacturers. Zero middlemen, up to 40% savings." },
      { name: "author", content: "GreenGear Agro" },
      { property: "og:title", content: "GreenGear Agro - Direct to Farm" },
      { property: "og:type", content: "website" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Mukta:wght@400;500;600;700;800;900&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body style={{ margin: 0, fontFamily: "'Mukta', sans-serif", background: "#F8F9FC" }}>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <I18nProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <CartProvider>
            <AppShell />
          </CartProvider>
        </AuthProvider>
      </QueryClientProvider>
    </I18nProvider>
  );
}

/* ── Shared Navbar ─────────────────────────────────────────────────── */
function SharedNav() {
  const { t, lang, setLang } = useI18n();
  const [scrolled, setScrolled]   = useState(false);
  const [menuOpen, setMenuOpen]   = useState(false);
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const isHome = currentPath === "/";

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMenuOpen(false); }, [currentPath]);

  const navLinks = [
    { label: t("nav.products"),        href: "/products",        icon: ShoppingBag },
    { label: t("nav.recommendations"), href: "/recommendations", icon: Leaf },
    { label: t("nav.supply"),          href: isHome ? "#supply"    : "/#supply",   icon: Link2 },
    { label: t("nav.features"),        href: isHome ? "#features"  : "/#features", icon: Home },
    { label: t("nav.partners"),        href: isHome ? "#partners"  : "/#partners", icon: Home },
  ];

  const isActive = (href: string) => {
    if (href.startsWith("/") && !href.startsWith("/#")) {
      return currentPath === href || currentPath.startsWith(href + "/");
    }
    return false;
  };

  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 200,
      background: scrolled ? "rgba(255,255,255,0.92)" : "#fff",
      backdropFilter: scrolled ? "blur(20px)" : "none",
      borderBottom: "1px solid #E8E8F0",
      boxShadow: scrolled ? "0 2px 20px rgba(0,0,0,0.06)" : "none",
      transition: "all 0.3s",
    }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 68 }}>

        {/* Logo */}
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
          <img src={logoUrl} alt="GreenGear" style={{ height: 40, width: "auto", objectFit: "contain" }} />
          <div>
            <div style={{ fontWeight: 900, fontSize: 18, color: "#0F0C29", letterSpacing: "-0.02em", lineHeight: 1 }}>GREENGEAR</div>
            <div style={{ fontSize: 9, color: "#6C48F2", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 2 }}>{t("nav.logoSubtitle")}</div>
          </div>
        </Link>

        {/* Desktop links */}
        <div style={{ display: "flex", gap: 8, alignItems: "center" }} className="nav-desktop">
          {navLinks.slice(0, 3).map(l => (
            <a key={l.href} href={l.href} style={{
              padding: "7px 14px", borderRadius: 100, fontSize: 12, fontWeight: 600,
              letterSpacing: "0.06em", textDecoration: "none", transition: "all 0.2s",
              background: isActive(l.href) ? "#6C48F2" : "transparent",
              color: isActive(l.href) ? "#fff" : "#5A5870",
            }}
              onMouseEnter={e => { if (!isActive(l.href)) (e.currentTarget as HTMLElement).style.background = "#F0EFF8"; (e.currentTarget as HTMLElement).style.color = "#6C48F2"; }}
              onMouseLeave={e => { if (!isActive(l.href)) { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "#5A5870"; } }}
            >{l.label}</a>
          ))}
        </div>

        {/* Right side */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Back button on inner pages */}
          {!isHome && (
            <button
              onClick={() => window.history.back()}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 100, border: "1.5px solid #E8E8F0", background: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 600, color: "#5A5870", transition: "all 0.2s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "#6C48F2"; (e.currentTarget as HTMLElement).style.color = "#6C48F2"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "#E8E8F0"; (e.currentTarget as HTMLElement).style.color = "#5A5870"; }}
            >
              <ChevronLeft size={14} /> {lang === "mr" ? "मागे" : "Back"}
            </button>
          )}

          {/* Cart button */}
          <CartNavButton />

          {/* Auth button */}
          <AuthNavButton />

          {/* Language toggle */}
          <button
            onClick={() => setLang(lang === "en" ? "mr" : "en")}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 100, border: "1.5px solid #E8E8F0", background: "#F8F9FC", cursor: "pointer", fontSize: 12, fontWeight: 700, color: "#0F0C29", transition: "all 0.2s" }}
          >
            <Globe size={13} style={{ color: "#6C48F2" }} />
            {lang === "en" ? "मराठी" : "English"}
          </button>

          {/* WhatsApp CTA */}
          <a href="https://wa.me/910000000000"
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 18px", borderRadius: 100, background: "linear-gradient(135deg,#6C48F2,#D946EF)", color: "#fff", fontSize: 12, fontWeight: 700, textDecoration: "none", transition: "opacity 0.2s" }}
            className="nav-wa-btn"
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = "0.88"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = "1"}
          >
            <MessageCircle size={14} />
            <span className="nav-wa-text">WhatsApp</span>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#22C55E", display: "inline-block" }} />
          </a>

          {/* Hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="nav-ham"
            style={{ display: "none", background: "none", border: "none", cursor: "pointer", padding: 6, color: "#0F0C29" }}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <div style={{ background: "#fff", borderTop: "1px solid #E8E8F0", padding: "16px 24px 24px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 20 }}>
            {navLinks.map(l => (
              <a key={l.href} href={l.href}
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 10, textDecoration: "none", fontWeight: 600, fontSize: 15, color: isActive(l.href) ? "#6C48F2" : "#0F0C29", background: isActive(l.href) ? "#F0EFF8" : "transparent" }}
              >
                <l.icon size={16} style={{ color: "#6C48F2", flexShrink: 0 }} />
                {l.label}
              </a>
            ))}
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => { setLang(lang === "en" ? "mr" : "en"); setMenuOpen(false); }}
              style={{ flex: 1, padding: "10px", borderRadius: 10, border: "1.5px solid #E8E8F0", background: "#F8F9FC", fontWeight: 700, fontSize: 13, cursor: "pointer", color: "#0F0C29" }}>
              <Globe size={13} style={{ marginRight: 6, color: "#6C48F2", verticalAlign: "middle" }} />
              {lang === "en" ? "मराठी" : "English"}
            </button>
            <a href="https://wa.me/910000000000"
              style={{ flex: 1, padding: "10px", borderRadius: 10, background: "#25D366", color: "#fff", fontWeight: 700, fontSize: 13, textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <MessageCircle size={14} /> WhatsApp
            </a>
          </div>
          {!isHome && (
            <button onClick={() => { window.history.back(); setMenuOpen(false); }}
              style={{ width: "100%", marginTop: 10, padding: "10px", borderRadius: 10, border: "1.5px solid #E8E8F0", background: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer", color: "#5A5870", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <ChevronLeft size={14} /> {lang === "mr" ? "मागील पृष्ठ" : "Go Back"}
            </button>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .nav-ham { display: flex !important; }
          .nav-wa-text { display: none; }
        }
        @media (max-width: 480px) {
          .nav-wa-btn { padding: 9px 12px !important; }
        }
      `}</style>
    </nav>
  );
}

/* ── Breadcrumb ─────────────────────────────────────────────────── */
function Breadcrumb() {
  const { t, lang } = useI18n();
  const routerState = useRouterState();
  const path = routerState.location.pathname;

  const crumbs: { label: string; href: string }[] = [
    { label: lang === "mr" ? "मुख्यपृष्ठ" : "Home", href: "/" },
  ];

  if (path === "/products")
    crumbs.push({ label: t("products.title"), href: "/products" });
  else if (path === "/recommendations")
    crumbs.push({ label: lang === "mr" ? "पीक मार्गदर्शक" : "Crop Guide", href: "/recommendations" });

  if (crumbs.length < 2) return null;

  return (
    <div style={{ background: "#fff", borderBottom: "1px solid #E8E8F0" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "10px 24px", display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#9896A8" }}>
        {crumbs.map((c, i) => (
          <span key={c.href} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {i > 0 && <span style={{ color: "#E8E8F0" }}>›</span>}
            {i < crumbs.length - 1
              ? <a href={c.href} style={{ color: "#6C48F2", textDecoration: "none", fontWeight: 600 }}>{c.label}</a>
              : <span style={{ color: "#0F0C29", fontWeight: 700 }}>{c.label}</span>
            }
          </span>
        ))}
      </div>
    </div>
  );
}

function AppShell() {
  const routerState = useRouterState();
  const isHome = routerState.location.pathname === "/";

  return (
    <div>
      {/* Shared navbar on ALL pages */}
      {isHome
        ? null  /* index.tsx renders its own sticky nav */
        : <SharedNav />
      }
      {/* Breadcrumb on inner pages */}
      <Breadcrumb />
      <div style={{ flex: 1 }}>
        <Outlet />
      </div>

      <CartDrawer />
    </div>
  );
}

/* ── 404 ─────────────────────────────────────────────────────────── */
function NotFoundComponent() {
  const { t } = useI18n();
  return (
    <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16, padding: 24, textAlign: "center", fontFamily: "'Mukta',sans-serif" }}>
      <div style={{ fontSize: 80, fontWeight: 900, color: "#6C48F2" }}>{t("404.code")}</div>
      <h2 style={{ fontSize: 24, fontWeight: 800, color: "#0F0C29" }}>{t("404.title")}</h2>
      <p style={{ fontSize: 15, color: "#5A5870" }}>{t("404.message")}</p>
      <a href="/" style={{ marginTop: 8, padding: "12px 28px", borderRadius: 100, background: "#6C48F2", color: "#fff", fontWeight: 700, textDecoration: "none" }}>{t("404.home")}</a>
    </div>
  );
}

/* ── Error ───────────────────────────────────────────────────────── */
function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  const { t } = useI18n();
  return (
    <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16, padding: 24, textAlign: "center", fontFamily: "'Mukta',sans-serif" }}>
      <div style={{ fontSize: 64 }}>⚠️</div>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: "#0F0C29" }}>{t("error.title")}</h2>
      <p style={{ fontSize: 15, color: "#5A5870" }}>{t("error.message")}</p>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
        <button onClick={() => { router.invalidate(); reset(); }}
          style={{ padding: "12px 24px", borderRadius: 100, background: "#6C48F2", color: "#fff", fontWeight: 700, border: "none", cursor: "pointer" }}>{t("error.tryAgain")}</button>
        <a href="/" style={{ padding: "12px 24px", borderRadius: 100, border: "1.5px solid #E8E8F0", color: "#0F0C29", fontWeight: 700, textDecoration: "none" }}>{t("error.goHome")}</a>
      </div>
    </div>
  );
}

/* -- Auth Nav Button ----------------------------------------------- */
function AuthNavButton() {
  const { isLogged, user, logout } = useAuth();
  const { lang } = useI18n();
  if (isLogged && user) {
    const dashHref = user.role === 'supplier' ? '/dashboard/supplier' : '/dashboard/farmer';
    return (
      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        <a href={dashHref} style={{ display:'flex',alignItems:'center',gap:6,padding:'7px 14px',borderRadius:100,border:'1.5px solid #6C48F2',background:'rgba(108,72,242,.07)',color:'#6C48F2',fontWeight:700,fontSize:12,textDecoration:'none' }}>
          {user.name.split(' ')[0]}
        </a>
        <button onClick={logout} style={{ padding:'7px 12px',borderRadius:100,border:'1.5px solid #E8E8F0',background:'#fff',cursor:'pointer',fontSize:11,fontWeight:600,color:'#9896A8' }}>
          {lang === 'mr' ? 'लागआउट' : 'Logout'}
        </button>
      </div>
    );
  }
  return (
    <a href='/auth/login' style={{ display:'flex',alignItems:'center',gap:6,padding:'7px 16px',borderRadius:100,border:'1.5px solid #6C48F2',background:'rgba(108,72,242,.07)',color:'#6C48F2',fontWeight:700,fontSize:12,textDecoration:'none' }}>
      {lang === 'mr' ? 'लॉगिन' : 'Login'}
    </a>
  );
}

/* ── Cart Nav Button ─────────────────────────────────────────────── */
function CartNavButton() {
  const { cartCount, setIsOpen } = useCart();
  return (
    <button onClick={() => setIsOpen(true)} style={{ position:"relative", display:"flex", alignItems:"center", justifyContent:"center", width:36, height:36, borderRadius:"50%", border:"1.5px solid #E8E8F0", background:"#F8F9FC", cursor:"pointer", color:"#5A5870", transition:"all 0.2s" }}>
      <ShoppingBag size={16} />
      {cartCount > 0 && (
        <span style={{ position:"absolute", top:-4, right:-4, background:"#EF4444", color:"#fff", fontSize:10, fontWeight:800, width:18, height:18, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center" }}>
          {cartCount}
        </span>
      )}
    </button>
  );
}
