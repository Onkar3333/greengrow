import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useI18n } from "@/lib/useI18n";
import { useAuth } from "@/lib/useAuth";
import { useCart } from "@/lib/useCart";
import { getProducts } from "@/functions";
import { ShoppingCart, Search, SlidersHorizontal, Plus } from "lucide-react";

import imgNets        from "@/assets/prod-nets.png";
import imgFert        from "@/assets/prod-fertilizer.png";
import imgDrip        from "@/assets/prod-drip.png";
import imgSeeds       from "@/assets/prod-seeds.png";
import imgSpray       from "@/assets/prod-spray.png";
import imgTools       from "@/assets/prod-tools.png";
import imgPlants      from "@/assets/cat-plants.jpg";
import imgBanana      from "@/assets/prod-banana-plant.png";
import imgOnion       from "@/assets/prod-onion-plant.png";
import imgVermi       from "@/assets/prod-vermi.png";
import imgUVCover     from "@/assets/prod-uv-cover.png";
import imgDripKit     from "@/assets/prod-drip-kit.png";
import imgPesticide   from "@/assets/prod-pesticide.png";
import imgSprayer     from "@/assets/prod-sprayer.png";
import imgMulch       from "@/assets/prod-mulch.png";
import imgGreenhouse  from "@/assets/prod-greenhouse.png";
import imgNPK         from "@/assets/prod-npk.png";

export const Route = createFileRoute("/products")({ component: ProductsPage });

/* ── full catalogue ───────────────────────────────────────────────── */
const ALL_PRODUCTS = [
  // NETS
  { id:1,  name:"Fruit Protection Net (Green)",   name_mr:"फळ संरक्षण जाळी (हिरवी)",      cat:"nets",       img:imgNets,       price:"₹850",   unit:"roll",    company:"Shree Agro Nets",     savings:35, featured:true  },
  { id:2,  name:"UV Fruit Cover Bag (White)",     name_mr:"UV फळ कव्हर बॅग (पांढरी)",      cat:"nets",       img:imgUVCover,    price:"₹320",   unit:"100 pcs", company:"Shree Agro Nets",     savings:28, featured:false },
  { id:3,  name:"Anti-Hail Net (Black)",          name_mr:"गारपीट विरोधी जाळी (काळी)",    cat:"nets",       img:imgNets,       price:"₹1,200", unit:"roll",    company:"Shree Agro Nets",     savings:30, featured:false },
  { id:4,  name:"Bird Protection Net",            name_mr:"पक्षी संरक्षण जाळी",            cat:"nets",       img:imgUVCover,    price:"₹680",   unit:"50 m",   company:"AgriGuard Nets",      savings:22, featured:false },
  // FERTILIZER
  { id:5,  name:"NPK Water Soluble Fertilizer",   name_mr:"NPK पाण्यात विरघळणारे खत",      cat:"fertilizer", img:imgNPK,        price:"₹680",   unit:"1 kg",   company:"BioGrow India",       savings:40, featured:true  },
  { id:6,  name:"Vermicompost Premium",           name_mr:"गांडूळ खत प्रीमियम",            cat:"fertilizer", img:imgVermi,      price:"₹450",   unit:"25 kg",  company:"BioGrow India",       savings:30, featured:false },
  { id:7,  name:"Organic Micronutrient Mix",      name_mr:"सूक्ष्म पोषक तत्व मिश्रण",      cat:"fertilizer", img:imgFert,       price:"₹380",   unit:"500 g",  company:"NatureFarm Agro",     savings:35, featured:false },
  { id:8,  name:"Boron Fertilizer (Solubor)",     name_mr:"बोरॉन खत (सोल्युबोर)",          cat:"fertilizer", img:imgNPK,        price:"₹220",   unit:"250 g",  company:"BioGrow India",       savings:25, featured:false },
  { id:9,  name:"Seaweed Extract (Growth)",       name_mr:"समुद्री शैवाल अर्क (वाढ)",       cat:"fertilizer", img:imgVermi,      price:"₹560",   unit:"1 L",    company:"NatureFarm Agro",     savings:32, featured:false },
  // DRIP
  { id:10, name:"Drip Irrigation Starter Kit",    name_mr:"ठिबक सिंचन स्टार्टर किट",       cat:"drip",       img:imgDripKit,    price:"₹2,400", unit:"kit",    company:"AquaSmart Agri",      savings:32, featured:true  },
  { id:11, name:"Inline Drip Tape 16mm",          name_mr:"इनलाइन ड्रिप टेप १६मिमी",       cat:"drip",       img:imgDrip,       price:"₹1,100", unit:"100 m",  company:"AquaSmart Agri",      savings:20, featured:false },
  { id:12, name:"Venturi Fertilizer Injector",    name_mr:"व्हेन्ट्युरी फर्टिलायझर इंजेक्टर",cat:"drip",     img:imgDripKit,    price:"₹860",   unit:"piece",  company:"AquaSmart Agri",      savings:18, featured:false },
  { id:13, name:"Rain Gun Sprinkler (Big)",        name_mr:"रेन गन स्प्रिंकलर (मोठा)",      cat:"drip",       img:imgDrip,       price:"₹3,200", unit:"piece",  company:"AquaSmart Agri",      savings:25, featured:false },
  // SEEDS
  { id:14, name:"Hybrid Tomato Seeds (Naveen)",   name_mr:"हायब्रीड टोमॅटो बियाणे (नवीन)", cat:"seeds",      img:imgSeeds,      price:"₹280",   unit:"10 g",   company:"VijayBio Seeds",      savings:25, featured:false },
  { id:15, name:"Onion Hybrid Seeds (N-2-4-1)",   name_mr:"कांदा हायब्रीड बियाणे (N-2-4-1)",cat:"seeds",    img:imgSeeds,      price:"₹350",   unit:"500 g",  company:"VijayBio Seeds",      savings:22, featured:true  },
  { id:16, name:"Grapes Cutting (Thomson)",        name_mr:"द्राक्ष कटिंग (थॉमसन)",         cat:"seeds",      img:imgSeeds,      price:"₹12",    unit:"cutting",company:"Nashik Vineyard Co.",  savings:20, featured:false },
  { id:17, name:"Pomegranate Cutting (Bhagwa)",   name_mr:"डाळिंब कटिंग (भगवा)",           cat:"seeds",      img:imgSeeds,      price:"₹25",    unit:"cutting",company:"Nashik Vineyard Co.",  savings:18, featured:false },
  // SPRAY
  { id:18, name:"Mancozeb 75% WP Fungicide",      name_mr:"मँकोझेब ७५% WP बुरशीनाशक",     cat:"spray",      img:imgPesticide,  price:"₹480",   unit:"1 kg",   company:"CropShield Agro",     savings:38, featured:false },
  { id:19, name:"Imidacloprid Insecticide",        name_mr:"इमिडाक्लोप्रिड कीटकनाशक",       cat:"spray",      img:imgSpray,      price:"₹320",   unit:"100 ml", company:"CropShield Agro",     savings:30, featured:false },
  { id:20, name:"Battery Operated Sprayer 16L",   name_mr:"बॅटरी स्प्रेयर १६ लिटर",         cat:"spray",      img:imgSprayer,    price:"₹2,800", unit:"piece",  company:"PowerSpray India",    savings:28, featured:true  },
  { id:21, name:"Knapsack Manual Sprayer 16L",    name_mr:"मॅन्युअल स्प्रेयर १६ लिटर",      cat:"spray",      img:imgSprayer,    price:"₹850",   unit:"piece",  company:"PowerSpray India",    savings:20, featured:false },
  // TOOLS
  { id:22, name:"Premium Pruning Shears",          name_mr:"प्रीमियम कातरणी",                cat:"tools",      img:imgTools,      price:"₹650",   unit:"piece",  company:"FarmTech Tools",      savings:20, featured:false },
  { id:23, name:"Black Silver Mulch Film 30 Mic",  name_mr:"काळी चांदी मल्च फिल्म ३० मायक्रॉन",cat:"tools",  img:imgMulch,      price:"₹1,400", unit:"roll",   company:"PolyFarm Sheets",     savings:25, featured:false },
  { id:24, name:"Polyhouse UV Film 200 Mic",       name_mr:"पॉलीहाउस UV फिल्म २०० मायक्रॉन",cat:"tools",    img:imgGreenhouse, price:"₹4,200", unit:"roll",   company:"PolyFarm Sheets",     savings:22, featured:false },
  // PLANTS
  { id:25, name:"Banana Tissue Plant (G9)",        name_mr:"केळी टिश्यू रोप (G9)",           cat:"plants",     img:imgBanana,     price:"₹45",    unit:"plant",  company:"Maharashtra Nursery", savings:15, featured:true  },
  { id:26, name:"Onion Seedling (Ready)",          name_mr:"कांदा रोपे (तयार)",               cat:"plants",     img:imgOnion,      price:"₹8",     unit:"100 pcs",company:"Maharashtra Nursery", savings:12, featured:false },
  { id:27, name:"Pomegranate Plant (Bhagwa)",      name_mr:"डाळिंब रोप (भगवा)",              cat:"plants",     img:imgBanana,     price:"₹120",   unit:"plant",  company:"Maharashtra Nursery", savings:18, featured:false },
  { id:28, name:"Mango Grafted Plant (Kesar)",     name_mr:"आंबा कलम रोप (केसर)",            cat:"plants",     img:imgOnion,      price:"₹180",   unit:"plant",  company:"Maharashtra Nursery", savings:15, featured:false },
];

const CATS = [
  { v:"all",        label:"All Products",         label_mr:"सर्व उत्पादने" },
  { v:"nets",       label:"Fruit Nets & Covers",  label_mr:"फळ जाळी" },
  { v:"fertilizer", label:"Organic Fertilizers",  label_mr:"सेंद्रिय खत" },
  { v:"drip",       label:"Drip Irrigation",      label_mr:"ठिबक सिंचन" },
  { v:"seeds",      label:"Seeds",                label_mr:"बियाणे" },
  { v:"spray",      label:"Spray Products",       label_mr:"फवारणी" },
  { v:"tools",      label:"Agri Tools",           label_mr:"शेती अवजारे" },
  { v:"plants",     label:"Plants",               label_mr:"रोपे" },
];

const S: Record<string,React.CSSProperties> = {
  page:   { maxWidth:1280, margin:"0 auto", padding:"48px 24px 100px", fontFamily:"'Mukta',sans-serif" },
  h1:     { fontSize:"clamp(28px,4vw,44px)", fontWeight:800, color:"#0F0C29", marginBottom:8 },
  sub:    { fontSize:15, color:"#5A5870", marginBottom:36 },
  strip:  { display:"flex", gap:10, overflowX:"auto", paddingBottom:4, marginBottom:40, scrollbarWidth:"none" },
  grid:   { display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:20 },
  card:   { background:"#fff", borderRadius:14, border:"1.5px solid #E8E8F0", overflow:"hidden", display:"flex", flexDirection:"column", transition:"box-shadow .2s,border-color .2s", cursor:"pointer" },
  imgBox: { position:"relative", aspectRatio:"4/3", overflow:"hidden", background:"#F0EFF8" },
  img:    { width:"100%", height:"100%", objectFit:"cover" },
  badge:  { position:"absolute", top:10, left:10, background:"#6C48F2", color:"#fff", fontSize:9, fontWeight:700, padding:"3px 9px", borderRadius:100, textTransform:"uppercase", letterSpacing:"0.08em" },
  save:   { position:"absolute", top:10, right:10, background:"#22C55E", color:"#fff", fontSize:9, fontWeight:700, padding:"3px 9px", borderRadius:100 },
  body:   { padding:"14px 16px", flex:1, display:"flex", flexDirection:"column" },
  co:     { fontSize:10, color:"#9896A8", textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:4 },
  nm:     { fontSize:15, fontWeight:700, color:"#0F0C29", lineHeight:1.3, marginBottom:3 },
  nmr:    { fontSize:12, color:"#5A5870", marginBottom:8 },
  price:  { fontSize:20, fontWeight:800, color:"#6C48F2", marginTop:"auto" },
  unit:   { fontSize:11, color:"#9896A8", marginTop:2 },
  foot:   { padding:"0 16px 16px" },
  buyBtn: { width:"100%", padding:"12px", borderRadius:10, background:"#6C48F2", color:"#fff", fontSize:14, fontWeight:700, border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8 },
  // modal
  overlay:{ position:"fixed", inset:0, background:"rgba(15,12,41,.6)", backdropFilter:"blur(6px)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:16 },
  modal:  { background:"#fff", borderRadius:20, width:"100%", maxWidth:520, maxHeight:"92vh", overflowY:"auto", boxShadow:"0 32px 80px rgba(0,0,0,.2)" },
  mhead:  { display:"flex", alignItems:"center", justifyContent:"space-between", padding:"24px 28px 0" },
  mh2:    { fontSize:20, fontWeight:800, color:"#0F0C29" },
  xbtn:   { width:36, height:36, borderRadius:"50%", border:"1.5px solid #E8E8F0", background:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"#5A5870" },
  mbody:  { padding:"20px 28px 28px" },
  // steps
  steps:  { display:"flex", marginBottom:28, position:"relative" },
  sline:  { position:"absolute", top:13, left:"15%", right:"15%", height:2, background:"#E8E8F0", zIndex:0 },
  step:   { flex:1, display:"flex", flexDirection:"column", alignItems:"center", position:"relative", zIndex:1 },
  scircle:{ width:28, height:28, borderRadius:"50%", border:"2px solid #E8E8F0", background:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, color:"#9896A8", marginBottom:6 },
  slabel: { fontSize:9, fontWeight:600, color:"#9896A8", textTransform:"uppercase", letterSpacing:"0.08em", textAlign:"center" },
  // mini card
  mini:   { display:"flex", gap:14, alignItems:"center", background:"#F8F9FC", borderRadius:12, padding:14, marginBottom:20 },
  miniImg:{ width:60, height:60, borderRadius:8, objectFit:"cover", flexShrink:0 },
  // field
  field:  { marginBottom:16 },
  flabel: { display:"block", fontSize:12, fontWeight:700, color:"#0F0C29", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:6 },
  finput: { width:"100%", padding:"12px 16px", borderRadius:10, border:"1.5px solid #E8E8F0", background:"#F8F9FC", fontFamily:"'Mukta',sans-serif", fontSize:15, color:"#0F0C29", outline:"none" },
  // qty
  qrow:   { display:"flex", alignItems:"center", gap:12 },
  qbtn:   { width:40, height:40, borderRadius:10, border:"1.5px solid #E8E8F0", background:"#F8F9FC", cursor:"pointer", fontSize:20, fontWeight:600, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 },
  qdis:   { flex:1, textAlign:"center", fontSize:22, fontWeight:800, color:"#0F0C29" },
  // review
  rbox:   { background:"#F8F9FC", borderRadius:12, padding:16, marginBottom:20 },
  rrow:   { display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid #E8E8F0", fontSize:14 },
  // action btn
  abtn:   { width:"100%", padding:15, borderRadius:12, border:"none", background:"linear-gradient(135deg,#6C48F2,#D946EF)", color:"#fff", fontSize:15, fontWeight:800, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:10 },
  back:   { background:"none", border:"none", cursor:"pointer", color:"#9896A8", fontSize:13, display:"flex", alignItems:"center", gap:4, marginBottom:16 },
  // success
  suc:    { textAlign:"center", padding:"8px 0 4px" },
  wabtn:  { marginTop:20, width:"100%", padding:15, background:"#25D366", color:"#fff", border:"none", borderRadius:12, fontSize:15, fontWeight:800, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:10 },
};

type Prod = { id: number|string; name: string; name_mr: string; cat: string; img: string; price: string; raw_price: number; unit: string; company: string; savings: number; featured: boolean };


/* ── Products Page ────────────────────────────────────────────────── */
export default function ProductsPage() {
  const { t, lang } = useI18n();
  const { addItem } = useCart();
  const [cat, setCat]           = useState("all");
  const [search, setSearch]     = useState("");
  const [featured, setFeatured] = useState(false);

  // Fetch live products from MongoDB; fall back to static array if empty
  const { data: liveProducts } = useQuery({
    queryKey: ["products", cat, search, featured],
    queryFn: () => getProducts({ data: {
      category: cat === "all" ? undefined : cat,
      search: search || undefined,
      featured: featured || undefined,
      limit: 60, skip: 0,
    }}),
    staleTime: 60_000,
  });

  const sourceList = (liveProducts && liveProducts.length > 0)
    ? liveProducts.map(p => ({
        id:       p._id,
        name:     p.name,
        name_mr:  p.name_mr ?? p.name,
        cat:      p.category,
        img:      p.image_url ?? "",
        price:    p.price_display,
        raw_price: p.price,
        unit:     p.unit,
        company:  p.supplier_name,
        savings:  p.savings_pct,
        featured: p.featured,
      }))
    : ALL_PRODUCTS.map(p => ({
        ...p,
        raw_price: parseInt(p.price.replace(/\D/g, "")) * 100,
      }));

  const filtered = sourceList.filter(p => {
    if (cat !== "all" && p.cat !== cat) return false;
    if (featured && !p.featured) return false;
    if (search) {
      const q = search.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.name_mr.toLowerCase().includes(q) || p.company.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div style={S.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Mukta:wght@400;600;700;800&display=swap');
        .prod-card:hover { box-shadow:0 8px 32px rgba(108,72,242,.13)!important; border-color:rgba(108,72,242,.4)!important; }
        .prod-card:hover img { transform:scale(1.05); }
        .buy-btn:hover { background:#5A38E0!important; transform:translateY(-1px); }
        .cat-btn:hover { border-color:#6C48F2!important; color:#6C48F2!important; }
        .modal-input:focus { border-color:#6C48F2!important; background:#fff!important; }
        ::-webkit-scrollbar { display:none; }
        @media(max-width:600px){
          .prod-grid { grid-template-columns:repeat(2,1fr)!important; gap:10px!important; }
        }
      `}</style>

      <h1 style={S.h1}>{t("products.title")}</h1>
      <p style={S.sub}>{lang==="mr" ? "थेट उत्पादकाकडून — मध्यस्थ नाही" : "Direct from manufacturer — zero middlemen"}</p>

      {/* Category strip */}
      <div style={S.strip}>
        {CATS.map(c => (
          <button key={c.v} className="cat-btn" onClick={()=>setCat(c.v)} style={{
            flexShrink:0, padding:"9px 18px", borderRadius:100, fontSize:13, fontWeight:600, cursor:"pointer",
            border: cat===c.v ? "2px solid #6C48F2" : "1.5px solid #E8E8F0",
            background: cat===c.v ? "#6C48F2" : "#fff",
            color: cat===c.v ? "#fff" : "#5A5870",
            transition:"all .18s",
          }}>
            {lang==="mr" ? c.label_mr : c.label}
          </button>
        ))}
      </div>

      {/* Search + filter bar */}
      <div style={{ display:"flex", gap:10, marginBottom:24, flexWrap:"wrap" }}>
        <div style={{ flex:1, minWidth:200, position:"relative" }}>
          <Search size={15} style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color:"#9896A8" }}/>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={lang==="mr" ? "उत्पादन शोधा..." : "Search products..."}
            style={{ width:"100%", padding:"11px 16px 11px 40px", borderRadius:10, border:"1.5px solid #E8E8F0", background:"#fff", fontSize:14, fontFamily:"'Mukta',sans-serif", color:"#0F0C29", outline:"none" }}
          />
        </div>
        <button
          onClick={() => setFeatured(f => !f)}
          style={{ display:"flex", alignItems:"center", gap:8, padding:"11px 18px", borderRadius:10, border:`1.5px solid ${featured?"#6C48F2":"#E8E8F0"}`, background: featured?"#6C48F2":"#fff", color: featured?"#fff":"#5A5870", fontWeight:700, fontSize:13, cursor:"pointer", whiteSpace:"nowrap" }}
        >
          <SlidersHorizontal size={14}/>
          {lang==="mr" ? "निवडक" : "Featured Only"}
        </button>
      </div>
      <p style={{ fontSize:13, color:"#9896A8", marginBottom:20 }}>
        {filtered.length} {lang==="mr" ? "उत्पादने" : "products"}
        {search && <> &mdash; "<strong style={{color:"#0F0C29"}}>{search}</strong>" {lang==="mr"?"साठी":"results"}</>}
      </p>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div style={{ textAlign:"center", padding:"80px 24px", color:"#9896A8" }}>
          <div style={{ fontSize:52, marginBottom:16 }}>🔍</div>
          <p style={{ fontSize:16 }}>{lang==="mr" ? "कोणतेही उत्पादन सापडले नाही." : "No products found. Try a different search."}</p>
        </div>
      ) : (
      <div style={S.grid} className="prod-grid">
        {filtered.map(p => (
          <div key={p.id} className="prod-card" style={S.card}>
            <div style={S.imgBox}>
              <img src={p.img} alt={p.name} style={{...S.img, transition:"transform .4s"}} />
              {p.featured && <span style={S.badge}>⭐ {lang==="mr"?"निवडक":"Featured"}</span>}
              <span style={S.save}>Save {p.savings}%</span>
            </div>
            <div style={S.body}>
              <div style={S.co}>{p.company}</div>
              <div style={S.nm}>{lang==="mr" ? p.name_mr : p.name}</div>
              <div style={S.price}>{p.price}</div>
              <div style={S.unit}>{t("products.per")} {p.unit}</div>
            </div>
            <div style={S.foot}>
              <button className="buy-btn" style={S.buyBtn} onClick={() => {
                addItem({
                  id: String(p.id),
                  name: p.name,
                  name_mr: p.name_mr,
                  price: p.raw_price,
                  qty: 1,
                  unit: p.unit,
                  img: p.img,
                  company: p.company
                });
              }}>
                <Plus size={16}/> {lang === "mr" ? "कार्टमध्ये टाका" : "Add to Cart"}
              </button>
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  );
}
