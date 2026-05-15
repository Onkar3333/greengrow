import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProducts, addProduct, updateProduct, deleteProduct, getSupplierOrders, updateOrderStatus } from "@/functions";
import { useAuth } from "@/lib/useAuth";
import { Plus, Package, ShoppingBag, Pencil, Trash2, Check, X, LogOut, ChevronDown, Store } from "lucide-react";
import type { Product, Order } from "@/functions";

export const Route = createFileRoute("/dashboard/supplier")({ component: SupplierDashboard });

const CATS = ["nets","fertilizer","drip","seeds","spray","tools","plants"] as const;
const STATUSES = ["pending","confirmed","shipped","delivered","cancelled"] as const;
const STATUS_COLOR: Record<string, string> = {
  pending:"#F59E0B", confirmed:"#6C48F2", shipped:"#0284C7", delivered:"#22C55E", cancelled:"#EF4444",
};

export default function SupplierDashboard() {
  const { token, user, logout, isLogged, isSupplier } = useAuth();
  
  const qc = useQueryClient();

  const [tab, setTab] = useState<"products"|"orders"|"add">("products");
  const [editId, setEditId] = useState<string|null>(null);

  // Redirect if not supplier
  if (!isLogged || !isSupplier) {
    return (
      <div style={{ minHeight:"60vh",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:16,fontFamily:"'Mukta',sans-serif" }}>
        <Store size={48} style={{ color:"#6C48F2" }}/>
        <h2 style={{ fontSize:22,fontWeight:800,color:"#0F0C29" }}>Supplier Access Required</h2>
        <p style={{ color:"#5A5870" }}>Please login as a supplier to access this dashboard.</p>
        <a href="/auth/login" style={{ padding:"12px 28px",borderRadius:100,background:"#6C48F2",color:"#fff",fontWeight:700,textDecoration:"none" }}>Login</a>
      </div>
    );
  }

  return (
    <div style={{ minHeight:"100vh",background:"#F8F9FC",fontFamily:"'Mukta',sans-serif" }}>
      {/* Top bar */}
      <div style={{ background:"#fff",borderBottom:"1px solid #E8E8F0",padding:"0 24px",display:"flex",alignItems:"center",justifyContent:"space-between",height:60 }}>
        <div style={{ display:"flex",alignItems:"center",gap:10 }}>
          <Store size={20} style={{ color:"#6C48F2" }}/>
          <span style={{ fontWeight:800,fontSize:16,color:"#0F0C29" }}>Supplier Dashboard</span>
          <span style={{ fontSize:13,color:"#9896A8",marginLeft:8 }}>Welcome, {user?.name}</span>
        </div>
        <button onClick={()=>{ logout(); window.location.href = '/';  }}
          style={{ display:"flex",alignItems:"center",gap:6,padding:"8px 16px",borderRadius:100,border:"1.5px solid #E8E8F0",background:"#fff",cursor:"pointer",fontSize:13,fontWeight:600,color:"#5A5870" }}>
          <LogOut size={14}/> Logout
        </button>
      </div>

      {/* Tab bar */}
      <div style={{ background:"#fff",borderBottom:"1px solid #E8E8F0",padding:"0 24px",display:"flex",gap:0 }}>
        {[
          { id:"products" as const, label:"My Products", icon:Package },
          { id:"orders"   as const, label:"Incoming Orders", icon:ShoppingBag },
          { id:"add"      as const, label:"+ Add Product", icon:Plus },
        ].map(({ id, label, icon:Icon }) => (
          <button key={id} onClick={()=>setTab(id)} style={{
            padding:"14px 20px",border:"none",background:"none",cursor:"pointer",
            fontWeight:700,fontSize:13,borderBottom:`2.5px solid ${tab===id?"#6C48F2":"transparent"}`,
            color: tab===id?"#6C48F2":"#5A5870",display:"flex",alignItems:"center",gap:6,
          }}>
            <Icon size={14}/> {label}
          </button>
        ))}
      </div>

      <div style={{ maxWidth:1100,margin:"0 auto",padding:"32px 24px" }}>
        {tab === "products" && <MyProducts token={token!} supplierId={user!.sub} editId={editId} setEditId={setEditId} />}
        {tab === "orders"   && <IncomingOrders token={token!} />}
        {tab === "add"      && <AddProductForm token={token!} onSuccess={()=>{ qc.invalidateQueries({queryKey:["sup-products"]}); setTab("products"); }} />}
      </div>
    </div>
  );
}

// ── My Products ───────────────────────────────────────────────────────────────
function MyProducts({ token, supplierId, editId, setEditId }: {
  token: string; supplierId: string;
  editId: string|null; setEditId: (id:string|null)=>void;
}) {
  const qc = useQueryClient();
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["sup-products", supplierId],
    queryFn: () => getProducts({ data: { supplier_id: supplierId, limit:100, skip:0 } }),
  });

  const deleteMut = useMutation({
    mutationFn: (id:string) => deleteProduct({ data: { token, product_id: id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey:["sup-products"] }),
  });

  if (isLoading) return <LoadingSkeleton />;

  if (!products.length) return (
    <div style={{ textAlign:"center",padding:"80px 24px",color:"#9896A8" }}>
      <Package size={48} style={{ marginBottom:16, color:"#E8E8F0" }}/>
      <p style={{ fontSize:16 }}>No products yet. Add your first product!</p>
    </div>
  );

  return (
    <div>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}>
        <h2 style={{ fontSize:20,fontWeight:800,color:"#0F0C29" }}>My Products ({products.length})</h2>
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:16 }}>
        {products.map((p: Product) => (
          <div key={p._id} style={{ background:"#fff",border:"1.5px solid #E8E8F0",borderRadius:14,overflow:"hidden" }}>
            {p.image_url
              ? <img src={p.image_url} alt={p.name} style={{ width:"100%",height:160,objectFit:"cover" }}/>
              : <div style={{ width:"100%",height:160,background:"linear-gradient(135deg,#EDE9FE,#F5F3FF)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:48 }}>🌿</div>
            }
            <div style={{ padding:16 }}>
              <div style={{ fontSize:10,color:"#9896A8",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:4 }}>{p.category}</div>
              <div style={{ fontWeight:700,fontSize:15,color:"#0F0C29",marginBottom:4 }}>{p.name}</div>
              <div style={{ fontSize:18,fontWeight:800,color:"#6C48F2",marginBottom:12 }}>{p.price_display} / {p.unit}</div>
              <div style={{ display:"flex",gap:8 }}>
                <span style={{ flex:1,padding:"7px",borderRadius:8,background: p.in_stock?"rgba(34,197,94,.1)":"rgba(239,68,68,.1)",color:p.in_stock?"#16A34A":"#DC2626",fontWeight:700,fontSize:11,textAlign:"center" }}>
                  {p.in_stock?"IN STOCK":"OUT OF STOCK"}
                </span>
                <button style={iconBtn} onClick={()=>setEditId(editId===p._id?null:p._id)} title="Edit"><Pencil size={14}/></button>
                <button style={{ ...iconBtn, background:"rgba(239,68,68,.08)", color:"#DC2626" }}
                  onClick={()=>{ if(confirm("Delete this product?")) deleteMut.mutate(p._id); }} title="Delete">
                  <Trash2 size={14}/>
                </button>
              </div>
              {editId === p._id && <EditProductForm token={token} product={p} onDone={()=>setEditId(null)} />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Edit Product (inline) ─────────────────────────────────────────────────────
function EditProductForm({ token, product, onDone }: { token:string; product:Product; onDone:()=>void }) {
  const qc = useQueryClient();
  const [price,    setPrice]   = useState(String(product.price/100));
  const [inStock,  setInStock] = useState(product.in_stock);
  const [featured, setFeat]    = useState(product.featured);

  const mut = useMutation({
    mutationFn: () => updateProduct({ data: { token, product_id: product._id, updates: { price: Math.round(parseFloat(price)*100), in_stock: inStock, featured } } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey:["sup-products"] }); onDone(); },
  });

  return (
    <div style={{ marginTop:12,padding:12,background:"#F8F9FC",borderRadius:10,display:"flex",flexDirection:"column",gap:10 }}>
      <div>
        <label style={sm}>Price (₹)</label>
        <input value={price} onChange={e=>setPrice(e.target.value)} style={fi} type="number"/>
      </div>
      <div style={{ display:"flex",gap:12,alignItems:"center" }}>
        <label style={{ display:"flex",alignItems:"center",gap:6,cursor:"pointer",fontSize:13,fontWeight:600 }}>
          <input type="checkbox" checked={inStock} onChange={e=>setInStock(e.target.checked)}/> In Stock
        </label>
        <label style={{ display:"flex",alignItems:"center",gap:6,cursor:"pointer",fontSize:13,fontWeight:600 }}>
          <input type="checkbox" checked={featured} onChange={e=>setFeat(e.target.checked)}/> Featured
        </label>
      </div>
      <div style={{ display:"flex",gap:8 }}>
        <button onClick={()=>mut.mutate()} disabled={mut.isPending} style={{ flex:1,padding:"9px",borderRadius:8,background:"#6C48F2",color:"#fff",border:"none",fontWeight:700,fontSize:13,cursor:"pointer" }}>
          <Check size={13} style={{ marginRight:4,verticalAlign:"middle" }}/> Save
        </button>
        <button onClick={onDone} style={{ padding:"9px 14px",borderRadius:8,border:"1.5px solid #E8E8F0",background:"#fff",cursor:"pointer",color:"#5A5870" }}>
          <X size={13}/>
        </button>
      </div>
    </div>
  );
}

// ── Incoming Orders ───────────────────────────────────────────────────────────
function IncomingOrders({ token }: { token: string }) {
  const qc = useQueryClient();
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["sup-orders"],
    queryFn: () => getSupplierOrders({ data: { token } }),
  });

  const statusMut = useMutation({
    mutationFn: ({ order_id, status }: { order_id:string; status:Order["status"] }) =>
      updateOrderStatus({ data: { token, order_id, status } }),
    onSuccess: () => qc.invalidateQueries({ queryKey:["sup-orders"] }),
  });

  if (isLoading) return <LoadingSkeleton />;
  if (!orders.length) return (
    <div style={{ textAlign:"center",padding:"80px 24px",color:"#9896A8" }}>
      <ShoppingBag size={48} style={{ marginBottom:16,color:"#E8E8F0" }}/>
      <p style={{ fontSize:16 }}>No orders yet.</p>
    </div>
  );

  return (
    <div>
      <h2 style={{ fontSize:20,fontWeight:800,color:"#0F0C29",marginBottom:20 }}>Incoming Orders ({orders.length})</h2>
      <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
        {orders.map((o: Order) => (
          <div key={o._id} style={{ background:"#fff",border:"1.5px solid #E8E8F0",borderRadius:14,padding:20 }}>
            <div style={{ display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:10,marginBottom:12 }}>
              <div>
                <div style={{ fontWeight:800,fontSize:15,color:"#0F0C29" }}>{o.farmer_name}</div>
                <div style={{ fontSize:13,color:"#5A5870" }}>{o.phone} {o.district ? "· "+o.district : ""}</div>
                <div style={{ fontSize:11,color:"#9896A8",marginTop:3 }}>{new Date(o.createdAt).toLocaleDateString("en-IN")}</div>
              </div>
              <div style={{ display:"flex",flexDirection:"column",gap:6,alignItems:"flex-end" }}>
                <span style={{ padding:"4px 12px",borderRadius:100,fontSize:11,fontWeight:700,background:`${STATUS_COLOR[o.status]}20`,color:STATUS_COLOR[o.status] }}>
                  {o.status.toUpperCase()}
                </span>
                <div style={{ fontWeight:800,color:"#6C48F2",fontSize:14 }}>₹{(o.total/100).toLocaleString("en-IN")}</div>
              </div>
            </div>
            <div style={{ marginBottom:12 }}>
              {o.items.map((it,i) => (
                <div key={i} style={{ fontSize:13,color:"#5A5870",padding:"4px 0",borderBottom:"1px solid #F0EFF8" }}>
                  {it.product_name} × {it.qty}
                </div>
              ))}
            </div>
            <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
              {(["confirmed","shipped","delivered","cancelled"] as const).map(st => (
                <button key={st} disabled={o.status===st||statusMut.isPending}
                  onClick={()=>statusMut.mutate({ order_id:o._id, status:st })}
                  style={{ padding:"7px 14px",borderRadius:8,border:`1.5px solid ${STATUS_COLOR[st]}40`,background:`${STATUS_COLOR[st]}12`,color:STATUS_COLOR[st],fontWeight:700,fontSize:11,cursor:"pointer",opacity:o.status===st?.5:1 }}>
                  Mark {st}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Add Product Form ──────────────────────────────────────────────────────────
function AddProductForm({ token, onSuccess }: { token:string; onSuccess:()=>void }) {
  const [name,     setName]    = useState("");
  const [nameMr,   setNameMr]  = useState("");
  const [cat,      setCat]     = useState<typeof CATS[number]>("fertilizer");
  const [price,    setPrice]   = useState("");
  const [unit,     setUnit]    = useState("kg");
  const [desc,     setDesc]    = useState("");
  const [imageUrl, setImgUrl]  = useState("");
  const [savings,  setSavings] = useState("25");
  const [crops,    setCrops]   = useState("");
  const [featured, setFeat]    = useState(false);

  const mut = useMutation({
    mutationFn: () => addProduct({ data: {
      token, name, name_mr: nameMr||undefined,
      category: cat, price: parseFloat(price), unit,
      description: desc||undefined, image_url: imageUrl||undefined,
      savings_pct: parseInt(savings)||0, featured,
      crop_tags: crops ? crops.split(",").map(s=>s.trim().toLowerCase()) : [],
      in_stock: true,
    }}),
    onSuccess,
  });

  const valid = name.trim().length>=2 && parseFloat(price)>0 && unit.trim().length>0;

  return (
    <div style={{ maxWidth:640 }}>
      <h2 style={{ fontSize:20,fontWeight:800,color:"#0F0C29",marginBottom:24 }}>Add New Product</h2>
      {mut.error && <div style={{ background:"#FEF2F2",border:"1px solid #FECACA",borderRadius:10,padding:"12px 16px",marginBottom:16,fontSize:14,color:"#DC2626" }}>{(mut.error as Error).message}</div>}
      {mut.isSuccess && <div style={{ background:"#F0FDF4",border:"1px solid #BBF7D0",borderRadius:10,padding:"12px 16px",marginBottom:16,fontSize:14,color:"#16A34A" }}>Product added successfully!</div>}

      <div style={{ background:"#fff",border:"1.5px solid #E8E8F0",borderRadius:14,padding:24,display:"flex",flexDirection:"column",gap:16 }}>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }}>
          <div>
            <label style={sm}>Product Name (English) *</label>
            <input value={name} onChange={e=>setName(e.target.value)} placeholder="Fruit Protection Net" style={fi}/>
          </div>
          <div>
            <label style={sm}>Product Name (मराठी)</label>
            <input value={nameMr} onChange={e=>setNameMr(e.target.value)} placeholder="फळ संरक्षण जाळी" style={fi}/>
          </div>
        </div>

        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14 }}>
          <div>
            <label style={sm}>Category *</label>
            <select value={cat} onChange={e=>setCat(e.target.value as typeof CATS[number])} style={{ ...fi, color:"#0F0C29" }}>
              {CATS.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
            </select>
          </div>
          <div>
            <label style={sm}>Price (₹) *</label>
            <input type="number" value={price} onChange={e=>setPrice(e.target.value)} placeholder="680" style={fi}/>
          </div>
          <div>
            <label style={sm}>Unit *</label>
            <input value={unit} onChange={e=>setUnit(e.target.value)} placeholder="kg / roll / piece" style={fi}/>
          </div>
        </div>

        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }}>
          <div>
            <label style={sm}>Savings % vs. market</label>
            <input type="number" value={savings} onChange={e=>setSavings(e.target.value)} placeholder="25" style={fi}/>
          </div>
          <div>
            <label style={sm}>Crop Tags (comma separated)</label>
            <input value={crops} onChange={e=>setCrops(e.target.value)} placeholder="banana, onion, grapes" style={fi}/>
          </div>
        </div>

        <div>
          <label style={sm}>Product Image URL</label>
          <input value={imageUrl} onChange={e=>setImgUrl(e.target.value)} placeholder="https://your-cdn.com/image.jpg" style={fi}/>
        </div>

        <div>
          <label style={sm}>Description</label>
          <textarea value={desc} onChange={e=>setDesc(e.target.value)} rows={3}
            placeholder="Describe your product: quality, specifications, usage..."
            style={{ ...fi, resize:"vertical", fontFamily:"'Mukta',sans-serif" }}/>
        </div>

        <label style={{ display:"flex",alignItems:"center",gap:8,cursor:"pointer",fontWeight:600,fontSize:14,color:"#0F0C29" }}>
          <input type="checkbox" checked={featured} onChange={e=>setFeat(e.target.checked)}/>
          Mark as Featured (shows ⭐ badge on product grid)
        </label>

        <button onClick={()=>mut.mutate()} disabled={!valid||mut.isPending} style={{
          padding:15,borderRadius:12,border:"none",background:"linear-gradient(135deg,#6C48F2,#D946EF)",
          color:"#fff",fontSize:15,fontWeight:800,cursor:(!valid||mut.isPending)?"not-allowed":"pointer",
          opacity:(!valid||mut.isPending)?.55:1,display:"flex",alignItems:"center",justifyContent:"center",gap:10,
        }}>
          <Plus size={18}/> {mut.isPending ? "Adding…" : "Add Product"}
        </button>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:16 }}>
      {[1,2,3,4].map(i => (
        <div key={i} style={{ height:260,borderRadius:14,background:"linear-gradient(90deg,#F0EFF8 25%,#E8E7F4 50%,#F0EFF8 75%)",backgroundSize:"200%",animation:"shimmer 1.4s infinite" }}/>
      ))}
      <style>{`@keyframes shimmer{0%{background-position:200% center}100%{background-position:-200% center}}`}</style>
    </div>
  );
}

const iconBtn: React.CSSProperties = { width:34,height:34,borderRadius:8,border:"1.5px solid #E8E8F0",background:"#F8F9FC",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"#5A5870" };
const sm: React.CSSProperties = { display:"block",fontSize:11,fontWeight:700,color:"#0F0C29",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:6 };
const fi: React.CSSProperties = { width:"100%",padding:"11px 14px",borderRadius:10,border:"1.5px solid #E8E8F0",background:"#F8F9FC",fontSize:14,fontFamily:"'Mukta',sans-serif",color:"#0F0C29",outline:"none",boxSizing:"border-box" };
