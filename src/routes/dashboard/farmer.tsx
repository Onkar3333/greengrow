import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getMyOrders } from "@/functions";
import { useAuth } from "@/lib/useAuth";
import { ShoppingBag, LogOut, Package, Clock, Truck, CheckCircle2, XCircle, Tractor } from "lucide-react";
import type { Order } from "@/functions";

export const Route = createFileRoute("/dashboard/farmer")({ component: FarmerDashboard });

const STATUS_META: Record<string, { label:string; color:string; icon:React.ReactNode }> = {
  pending:   { label:"Pending",   color:"#F59E0B", icon:<Clock size={14}/> },
  confirmed: { label:"Confirmed", color:"#6C48F2", icon:<CheckCircle2 size={14}/> },
  shipped:   { label:"Shipped",   color:"#0284C7", icon:<Truck size={14}/> },
  delivered: { label:"Delivered", color:"#22C55E", icon:<CheckCircle2 size={14}/> },
  cancelled: { label:"Cancelled", color:"#EF4444", icon:<XCircle size={14}/> },
};

export default function FarmerDashboard() {
  const { token, user, logout, isLogged, isFarmer } = useAuth();
  

  if (!isLogged || !isFarmer) {
    return (
      <div style={{ minHeight:"60vh",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:16,fontFamily:"'Mukta',sans-serif" }}>
        <Tractor size={48} style={{ color:"#6C48F2" }}/>
        <h2 style={{ fontSize:22,fontWeight:800,color:"#0F0C29" }}>Farmer Access Required</h2>
        <p style={{ color:"#5A5870" }}>Please login as a farmer to view your orders.</p>
        <a href="/auth/login" style={{ padding:"12px 28px",borderRadius:100,background:"#6C48F2",color:"#fff",fontWeight:700,textDecoration:"none" }}>Login</a>
      </div>
    );
  }

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["my-orders"],
    queryFn:  () => getMyOrders({ data: { token: token! } }),
    enabled: !!token,
  });

  const counts = orders.reduce((acc: Record<string,number>, o: Order) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {} as Record<string,number>);

  return (
    <div style={{ minHeight:"100vh",background:"#F8F9FC",fontFamily:"'Mukta',sans-serif" }}>
      {/* Top bar */}
      <div style={{ background:"#fff",borderBottom:"1px solid #E8E8F0",padding:"0 24px",display:"flex",alignItems:"center",justifyContent:"space-between",height:60 }}>
        <div style={{ display:"flex",alignItems:"center",gap:10 }}>
          <Tractor size={20} style={{ color:"#6C48F2" }}/>
          <span style={{ fontWeight:800,fontSize:16,color:"#0F0C29" }}>My Orders</span>
          <span style={{ fontSize:13,color:"#9896A8",marginLeft:8 }}>Welcome, {user?.name}</span>
        </div>
        <div style={{ display:"flex",gap:10 }}>
          <a href="/products" style={{ display:"flex",alignItems:"center",gap:6,padding:"8px 16px",borderRadius:100,background:"#6C48F2",color:"#fff",fontWeight:700,fontSize:13,textDecoration:"none" }}>
            <ShoppingBag size={14}/> Shop
          </a>
          <button onClick={()=>{ logout(); window.location.href = '/'; }}
            style={{ display:"flex",alignItems:"center",gap:6,padding:"8px 16px",borderRadius:100,border:"1.5px solid #E8E8F0",background:"#fff",cursor:"pointer",fontSize:13,fontWeight:600,color:"#5A5870" }}>
            <LogOut size={14}/> Logout
          </button>
        </div>
      </div>

      <div style={{ maxWidth:900,margin:"0 auto",padding:"32px 24px" }}>
        {/* Stats row */}
        <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:12,marginBottom:32 }}>
          <StatCard label="Total Orders" value={orders.length} color="#6C48F2"/>
          <StatCard label="Pending"   value={counts.pending??0}   color="#F59E0B"/>
          <StatCard label="Shipped"   value={counts.shipped??0}   color="#0284C7"/>
          <StatCard label="Delivered" value={counts.delivered??0} color="#22C55E"/>
        </div>

        <h2 style={{ fontSize:20,fontWeight:800,color:"#0F0C29",marginBottom:20 }}>Order History</h2>

        {isLoading ? (
          <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
            {[1,2,3].map(i => <div key={i} style={{ height:120,borderRadius:14,background:"linear-gradient(90deg,#F0EFF8 25%,#E8E7F4 50%,#F0EFF8 75%)",backgroundSize:"200%",animation:"shimmer 1.4s infinite" }}/>)}
          </div>
        ) : !orders.length ? (
          <div style={{ textAlign:"center",padding:"80px 24px",color:"#9896A8" }}>
            <Package size={48} style={{ marginBottom:16,color:"#E8E8F0" }}/>
            <p style={{ fontSize:16,marginBottom:16 }}>No orders yet. Start shopping!</p>
            <a href="/products" style={{ padding:"12px 28px",borderRadius:100,background:"#6C48F2",color:"#fff",fontWeight:700,textDecoration:"none" }}>Browse Products</a>
          </div>
        ) : (
          <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
            {orders.map((o: Order) => {
              const meta = STATUS_META[o.status] ?? STATUS_META.pending;
              return (
                <div key={o._id} style={{ background:"#fff",border:"1.5px solid #E8E8F0",borderRadius:14,padding:20 }}>
                  <div style={{ display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:10,marginBottom:12 }}>
                    <div>
                      <div style={{ fontWeight:700,fontSize:15,color:"#0F0C29",marginBottom:2 }}>
                        Order #{o._id.slice(-6).toUpperCase()}
                      </div>
                      <div style={{ fontSize:12,color:"#9896A8" }}>
                        {new Date(o.createdAt).toLocaleDateString("en-IN",{ day:"numeric",month:"short",year:"numeric" })}
                      </div>
                    </div>
                    <div style={{ display:"flex",flexDirection:"column",alignItems:"flex-end",gap:6 }}>
                      <span style={{ display:"flex",alignItems:"center",gap:5,padding:"5px 12px",borderRadius:100,fontSize:11,fontWeight:700,background:`${meta.color}18`,color:meta.color }}>
                        {meta.icon} {meta.label}
                      </span>
                      <span style={{ fontWeight:800,color:"#6C48F2",fontSize:15 }}>
                        ₹{(o.total/100).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>

                  {/* Items */}
                  <div style={{ background:"#F8F9FC",borderRadius:10,padding:"12px 14px",marginBottom:12 }}>
                    {o.items.map((it,i) => (
                      <div key={i} style={{ display:"flex",justifyContent:"space-between",fontSize:13,color:"#5A5870",padding:"4px 0" }}>
                        <span>{it.product_name}</span>
                        <span style={{ fontWeight:600 }}>× {it.qty} — ₹{(it.price*it.qty/100).toLocaleString("en-IN")}</span>
                      </div>
                    ))}
                  </div>

                  {/* Track / reorder */}
                  <div style={{ display:"flex",gap:10 }}>
                    {o.status !== "delivered" && o.status !== "cancelled" && (
                      <div style={{ fontSize:12,color:"#9896A8",flex:1 }}>
                        {o.status === "pending" && "⏳ Your order is being reviewed by the supplier."}
                        {o.status === "confirmed" && "✅ Order confirmed — will be shipped soon."}
                        {o.status === "shipped" && "🚚 Your order is on its way!"}
                      </div>
                    )}
                    <a href="/products" style={{ padding:"8px 16px",borderRadius:8,background:"#F0EFF8",color:"#6C48F2",fontWeight:700,fontSize:12,textDecoration:"none",flexShrink:0 }}>
                      + Reorder
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <style>{`@keyframes shimmer{0%{background-position:200% center}100%{background-position:-200% center}}`}</style>
    </div>
  );
}

function StatCard({ label, value, color }: { label:string; value:number; color:string }) {
  return (
    <div style={{ background:"#fff",border:"1.5px solid #E8E8F0",borderRadius:12,padding:"16px 20px" }}>
      <div style={{ fontSize:28,fontWeight:800,color }}>{value}</div>
      <div style={{ fontSize:12,fontWeight:600,color:"#9896A8",marginTop:4 }}>{label}</div>
    </div>
  );
}
