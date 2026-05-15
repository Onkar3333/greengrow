import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { authSignup } from "@/functions";
import { useAuth } from "@/lib/useAuth";
import { Eye, EyeOff, UserPlus, Leaf, Tractor, Store } from "lucide-react";

export const Route = createFileRoute("/auth/signup")({ component: SignupPage });

const DISTRICTS = ["Nashik","Pune","Sangli","Satara","Solapur","Aurangabad","Kolhapur","Jalgaon","Ahmednagar","Dhule"];

export default function SignupPage() {
  const { setToken } = useAuth();

  const [role,     setRole]    = useState<"farmer"|"supplier">("farmer");
  const [name,     setName]    = useState("");
  const [email,    setEmail]   = useState("");
  const [phone,    setPhone]   = useState("");
  const [company,  setCompany] = useState("");
  const [district, setDistrict]= useState("");
  const [pass,     setPass]    = useState("");
  const [show,     setShow]    = useState(false);

  const mut = useMutation({
    mutationFn: () => authSignup({ data: {
      role, name, email, phone, password: pass,
      company: role==="supplier" ? company : undefined,
      district: district || undefined,
    }}),
    onSuccess: (res) => {
      setToken(res.token);
      window.location.href = role === "supplier" ? "/dashboard/supplier" : "/dashboard/farmer";
    },
  });

  const validPhone = /^[6-9]\d{9}$/.test(phone);
  const valid = name.trim().length>=2 && /\S+@\S+\.\S+/.test(email) && validPhone && pass.length>=6
    && (role==="farmer" || company.trim().length>=2);

  const lbl: React.CSSProperties = { display:"block", fontSize:12, fontWeight:700, color:"#0F0C29", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:7 };
  const inp: React.CSSProperties = { width:"100%", padding:"13px 16px", borderRadius:10, border:"1.5px solid #E8E8F0", background:"#F8F9FC", fontSize:15, fontFamily:"'Mukta',sans-serif", color:"#0F0C29", outline:"none", boxSizing:"border-box" };

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(135deg,#F0EFF8,#F8F9FC)", display:"flex", alignItems:"center", justifyContent:"center", padding:16, fontFamily:"'Mukta',sans-serif" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} .ai:focus{border-color:#6C48F2!important;background:#fff!important;}`}</style>

      <div style={{ background:"#fff", borderRadius:20, padding:"40px 36px", width:"100%", maxWidth:500, boxShadow:"0 20px 60px rgba(108,72,242,.12)", border:"1px solid #E8E8F0" }}>
        {/* Header */}
        <div style={{ textAlign:"center", marginBottom:28 }}>
          <div style={{ width:56,height:56,borderRadius:16,background:"linear-gradient(135deg,#6C48F2,#D946EF)", display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px" }}>
            <Leaf size={28} color="#fff"/>
          </div>
          <h1 style={{ fontSize:26,fontWeight:800,color:"#0F0C29",margin:0 }}>Create Account</h1>
          <p style={{ color:"#5A5870",marginTop:6,fontSize:14 }}>Join the GreenGear marketplace</p>
        </div>

        {/* Role selector */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:24 }}>
          {([
            { r:"farmer"   as const, Icon:Tractor, label:"I'm a Farmer",   sub:"Buy farm inputs" },
            { r:"supplier" as const, Icon:Store,   label:"I'm a Supplier", sub:"Sell your products" },
          ]).map(({ r, Icon, label, sub }) => (
            <button key={r} onClick={()=>setRole(r)} style={{
              padding:"16px 12px", borderRadius:12,
              border:`2px solid ${role===r ? "#6C48F2" : "#E8E8F0"}`,
              background: role===r ? "rgba(108,72,242,.06)" : "#F8F9FC",
              cursor:"pointer", textAlign:"left", transition:"all .15s",
            }}>
              <Icon size={20} style={{ color:"#6C48F2", marginBottom:8 }}/>
              <div style={{ fontWeight:700, fontSize:14, color:"#0F0C29" }}>{label}</div>
              <div style={{ fontSize:11, color:"#9896A8", marginTop:2 }}>{sub}</div>
            </button>
          ))}
        </div>

        {/* Error */}
        {mut.error && (
          <div style={{ background:"#FEF2F2", border:"1px solid #FECACA", borderRadius:10, padding:"12px 16px", marginBottom:16, fontSize:14, color:"#DC2626" }}>
            {(mut.error as Error).message}
          </div>
        )}

        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <div>
              <label style={lbl}>Full Name *</label>
              <input value={name} onChange={e=>setName(e.target.value)} placeholder="Rajesh Patil" style={inp} className="ai"/>
            </div>
            <div>
              <label style={lbl}>Phone *</label>
              <input type="tel" maxLength={10} value={phone} onChange={e=>setPhone(e.target.value)} placeholder="9876543210" style={{ ...inp, borderColor: phone && !validPhone ? "#EF4444" : "#E8E8F0" }} className="ai"/>
            </div>
          </div>

          {role === "supplier" && (
            <div>
              <label style={lbl}>Company Name *</label>
              <input value={company} onChange={e=>setCompany(e.target.value)} placeholder="Your Agro Company Pvt Ltd" style={inp} className="ai"/>
            </div>
          )}

          <div>
            <label style={lbl}>Email Address *</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" style={inp} className="ai"/>
          </div>

          <div>
            <label style={lbl}>District</label>
            <select value={district} onChange={e=>setDistrict(e.target.value)} style={{ ...inp, color: district ? "#0F0C29" : "#9896A8" }}>
              <option value="">Select district (optional)</option>
              {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <div>
            <label style={lbl}>Password *</label>
            <div style={{ position:"relative" }}>
              <input type={show?"text":"password"} value={pass} onChange={e=>setPass(e.target.value)}
                placeholder="Min 6 characters" style={{ ...inp, paddingRight:44 }} className="ai"/>
              <button onClick={()=>setShow(s=>!s)} style={{ position:"absolute",right:14,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:"#9896A8" }}>
                {show ? <EyeOff size={16}/> : <Eye size={16}/>}
              </button>
            </div>
          </div>

          <button onClick={()=>mut.mutate()} disabled={!valid||mut.isPending} style={{
            padding:15, borderRadius:12, border:"none",
            background: "linear-gradient(135deg,#6C48F2,#D946EF)",
            color:"#fff", fontSize:15, fontWeight:800,
            display:"flex", alignItems:"center", justifyContent:"center", gap:10,
            opacity: (!valid||mut.isPending) ? 0.5 : 1,
            cursor: (!valid||mut.isPending) ? "not-allowed" : "pointer",
          }}>
            {mut.isPending
              ? <span style={{ display:"inline-block",width:18,height:18,border:"2.5px solid rgba(255,255,255,.4)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin .7s linear infinite" }}/>
              : <><UserPlus size={16}/> Create Account</>}
          </button>
        </div>

        <p style={{ textAlign:"center", marginTop:20, fontSize:14, color:"#5A5870" }}>
          Already have an account?{" "}
          <a href="/auth/login" style={{ color:"#6C48F2", fontWeight:700, textDecoration:"none" }}>Sign In</a>
        </p>
        <p style={{ textAlign:"center", marginTop:8, fontSize:13, color:"#9896A8" }}>
          <a href="/" style={{ color:"#9896A8", textDecoration:"none" }}>← Back to Home</a>
        </p>
      </div>
    </div>
  );
}
