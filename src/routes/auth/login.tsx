import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { authLogin } from "@/functions";
import { useAuth } from "@/lib/useAuth";
import { Eye, EyeOff, LogIn, Leaf } from "lucide-react";

export const Route = createFileRoute("/auth/login")({ component: LoginPage });

export default function LoginPage() {
  const { setToken } = useAuth();
  const [email, setEmail]   = useState("");
  const [pass,  setPass]    = useState("");
  const [show,  setShow]    = useState(false);

  const mut = useMutation({
    mutationFn: () => authLogin({ data: { email, password: pass } }),
    onSuccess: (res) => {
      setToken(res.token);
      window.location.href = res.user.role === "supplier" ? "/dashboard/supplier" : "/dashboard/farmer";
    },
  });

  const valid = /\S+@\S+\.\S+/.test(email) && pass.length >= 6;

  return (
    <div style={pg}>
      <style>{css}</style>
      <div style={card}>
        {/* Logo */}
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <div style={{ width:56,height:56,borderRadius:16,background:"linear-gradient(135deg,#6C48F2,#D946EF)", display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px" }}>
            <Leaf size={28} color="#fff"/>
          </div>
          <h1 style={{ fontSize:28, fontWeight:800, color:"#0F0C29", margin:0 }}>Welcome back</h1>
          <p style={{ color:"#5A5870", marginTop:6, fontSize:14 }}>Sign in to your GreenGear account</p>
        </div>

        {/* Error */}
        {mut.error && (
          <div style={{ background:"#FEF2F2", border:"1px solid #FECACA", borderRadius:10, padding:"12px 16px", marginBottom:20, fontSize:14, color:"#DC2626" }}>
            {(mut.error as Error).message}
          </div>
        )}

        {/* Form */}
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <div>
            <label style={lbl}>Email Address</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
              placeholder="you@example.com" style={inp}
              className="auth-input" />
          </div>
          <div>
            <label style={lbl}>Password</label>
            <div style={{ position:"relative" }}>
              <input type={show?"text":"password"} value={pass} onChange={e=>setPass(e.target.value)}
                placeholder="••••••••" style={{ ...inp, paddingRight:44 }}
                className="auth-input"
                onKeyDown={e=>{ if(e.key==="Enter" && valid) mut.mutate(); }} />
              <button onClick={()=>setShow(s=>!s)}
                style={{ position:"absolute",right:14,top:"50%",transform:"translateY(-50%)", background:"none",border:"none",cursor:"pointer",color:"#9896A8" }}>
                {show ? <EyeOff size={16}/> : <Eye size={16}/>}
              </button>
            </div>
          </div>

          <button onClick={()=>mut.mutate()} disabled={!valid||mut.isPending} style={{
            ...btn, opacity: (!valid||mut.isPending) ? 0.55 : 1,
            cursor: (!valid||mut.isPending) ? "not-allowed" : "pointer",
          }}>
            {mut.isPending
              ? <span style={{ display:"inline-block",width:18,height:18,border:"2.5px solid rgba(255,255,255,.4)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin .7s linear infinite" }}/>
              : <><LogIn size={16}/> Sign In</>}
          </button>
        </div>

        <p style={{ textAlign:"center", marginTop:24, fontSize:14, color:"#5A5870" }}>
          Don't have an account?{" "}
          <a href="/auth/signup" style={{ color:"#6C48F2", fontWeight:700, textDecoration:"none" }}>Sign Up</a>
        </p>
        <p style={{ textAlign:"center", marginTop:8, fontSize:13, color:"#9896A8" }}>
          <a href="/" style={{ color:"#9896A8", textDecoration:"none" }}>← Back to Home</a>
        </p>
      </div>
    </div>
  );
}

const pg:  React.CSSProperties = { minHeight:"100vh", background:"linear-gradient(135deg,#F0EFF8 0%,#F8F9FC 100%)", display:"flex", alignItems:"center", justifyContent:"center", padding:16, fontFamily:"'Mukta',sans-serif" };
const card:React.CSSProperties = { background:"#fff", borderRadius:20, padding:"40px 36px", width:"100%", maxWidth:440, boxShadow:"0 20px 60px rgba(108,72,242,.12)", border:"1px solid #E8E8F0" };
const lbl: React.CSSProperties = { display:"block", fontSize:12, fontWeight:700, color:"#0F0C29", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:7 };
const inp: React.CSSProperties = { width:"100%", padding:"13px 16px", borderRadius:10, border:"1.5px solid #E8E8F0", background:"#F8F9FC", fontSize:15, fontFamily:"'Mukta',sans-serif", color:"#0F0C29", outline:"none", boxSizing:"border-box" };
const btn: React.CSSProperties = { width:"100%", padding:15, borderRadius:12, border:"none", background:"linear-gradient(135deg,#6C48F2,#D946EF)", color:"#fff", fontSize:15, fontWeight:800, display:"flex", alignItems:"center", justifyContent:"center", gap:10 };
const css = `@keyframes spin{to{transform:rotate(360deg)}} .auth-input:focus{border-color:#6C48F2!important;background:#fff!important;}`;
