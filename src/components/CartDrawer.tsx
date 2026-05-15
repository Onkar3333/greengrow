import { useCart } from "@/lib/useCart";
import { useAuth } from "@/lib/useAuth";
import { useI18n } from "@/lib/useI18n";
import { X, Trash2, ArrowRight, Loader2, MessageCircle, Check } from "lucide-react";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { placeOrder } from "@/functions";
import { useNavigate } from "@tanstack/react-router";

export function CartDrawer() {
  const { items, isOpen, setIsOpen, updateQty, removeItem, cartTotal, clearCart } = useCart();
  const { token, user, isLogged } = useAuth();
  const { t, lang } = useI18n();
  const navigate = useNavigate();

  const [step, setStep] = useState<"cart"|"checkout"|"success">("cart");
  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState("");
  const [dist, setDist] = useState("");
  const [orderId, setOrderId] = useState<string|null>(null);
  const [waLink, setWaLink] = useState("");

  const valid = name.trim().length >= 2 && /^[6-9]\d{9}$/.test(phone);

  const orderMut = useMutation({
    mutationFn: () => placeOrder({ data: {
      token: token ?? undefined,
      name, phone, district: dist || undefined,
      items: items.map(i => ({ product_id: i.id, product_name: i.name, qty: i.qty, price: i.price })),
    }}),
    onSuccess: (res) => {
      setWaLink(res.whatsapp_link);
      if (res.order_id) setOrderId(res.order_id);
      setStep("success");
      clearCart();
    },
  });

  if (!isOpen) return null;

  const close = () => {
    setIsOpen(false);
    setTimeout(() => setStep("cart"), 300);
  };

  return (
    <>
      <div style={{ position:"fixed", inset:0, background:"rgba(15,12,41,.6)", backdropFilter:"blur(4px)", zIndex:9999 }} onClick={close} />
      <div style={{ position:"fixed", top:0, bottom:0, right:0, width:"100%", maxWidth:420, background:"#fff", zIndex:10000, display:"flex", flexDirection:"column", boxShadow:"-10px 0 40px rgba(0,0,0,0.1)", fontFamily:"'Mukta',sans-serif", animation:"slideIn .3s ease forwards" }}>
        <style>{`@keyframes slideIn { from{transform:translateX(100%)} to{transform:translateX(0)} }`}</style>
        
        {/* Header */}
        <div style={{ padding:"20px 24px", borderBottom:"1px solid #E8E8F0", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <h2 style={{ fontSize:20, fontWeight:800, color:"#0F0C29", margin:0 }}>
            {step === "cart" && (lang === "mr" ? "तुमची कार्ट" : "Your Cart")}
            {step === "checkout" && (lang === "mr" ? "चेकआउट" : "Checkout")}
            {step === "success" && (lang === "mr" ? "ऑर्डर पूर्ण" : "Order Complete")}
          </h2>
          <button onClick={close} style={{ width:32, height:32, borderRadius:"50%", border:"1.5px solid #E8E8F0", background:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <X size={16} color="#5A5870" />
          </button>
        </div>

        {/* Body */}
        <div style={{ flex:1, overflowY:"auto", padding:"24px" }}>
          {step === "cart" && (
            items.length === 0 ? (
              <div style={{ textAlign:"center", marginTop:80, color:"#9896A8" }}>
                <div style={{ fontSize:48, marginBottom:16 }}>🛒</div>
                <p style={{ fontSize:16 }}>{lang === "mr" ? "तुमची कार्ट रिकामी आहे." : "Your cart is empty."}</p>
                <button onClick={close} style={{ marginTop:16, padding:"10px 20px", borderRadius:100, border:"none", background:"#F8F9FC", color:"#6C48F2", fontWeight:700, cursor:"pointer" }}>
                  {lang === "mr" ? "खरेदी सुरू करा" : "Start Shopping"}
                </button>
              </div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                {items.map(i => (
                  <div key={i.id} style={{ display:"flex", gap:16, background:"#F8F9FC", padding:12, borderRadius:12 }}>
                    <img src={i.img} style={{ width:72, height:72, borderRadius:8, objectFit:"cover" }} />
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:700, fontSize:15, color:"#0F0C29" }}>{lang === "mr" ? i.name_mr : i.name}</div>
                      <div style={{ fontSize:14, color:"#6C48F2", fontWeight:800, marginTop:4 }}>₹{(i.price/100).toLocaleString("en-IN")} <span style={{fontSize:12,color:"#9896A8",fontWeight:400}}>/{i.unit}</span></div>
                      
                      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:10 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:12, background:"#fff", border:"1.5px solid #E8E8F0", borderRadius:8, padding:"2px 8px" }}>
                          <button onClick={()=>updateQty(i.id, -1)} style={{ background:"none", border:"none", cursor:"pointer", fontSize:18, color:"#5A5870" }}>−</button>
                          <span style={{ fontSize:14, fontWeight:700, color:"#0F0C29", minWidth:16, textAlign:"center" }}>{i.qty}</span>
                          <button onClick={()=>updateQty(i.id, 1)} style={{ background:"none", border:"none", cursor:"pointer", fontSize:18, color:"#5A5870" }}>+</button>
                        </div>
                        <button onClick={()=>removeItem(i.id)} style={{ background:"none", border:"none", cursor:"pointer", color:"#EF4444" }}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {step === "checkout" && (
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
              {!isLogged && (
                <div style={{ background:"rgba(108,72,242,.08)", padding:16, borderRadius:12, marginBottom:8 }}>
                  <p style={{ fontSize:14, color:"#6C48F2", margin:0, fontWeight:600 }}>{lang === "mr" ? "जलद चेकआउटसाठी लॉगिन करा" : "Login for faster checkout"}</p>
                  <button onClick={()=>{close(); navigate({to:"/auth/login"});}} style={{ marginTop:8, padding:"8px 16px", borderRadius:100, border:"none", background:"#6C48F2", color:"#fff", fontWeight:700, fontSize:12, cursor:"pointer" }}>{lang === "mr" ? "लॉगिन" : "Login"}</button>
                </div>
              )}
              
              <div>
                <label style={lbl}>{t("products.labelYourName")}</label>
                <input style={inp} value={name} onChange={e=>setName(e.target.value)} placeholder={t("products.placeholderFarmerName")} />
              </div>
              <div>
                <label style={lbl}>{t("products.labelPhoneNumber")}</label>
                <input style={inp} type="tel" maxLength={10} value={phone} onChange={e=>setPhone(e.target.value)} placeholder={t("products.placeholderPhone")} />
              </div>
              <div>
                <label style={lbl}>{t("products.labelDistrictOptional")}</label>
                <input style={inp} value={dist} onChange={e=>setDist(e.target.value)} placeholder={lang==="mr"?"उदा. नाशिक, पुणे":"e.g. Nashik, Pune"} />
              </div>

              <div style={{ marginTop:16, background:"#F8F9FC", padding:16, borderRadius:12 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8, fontSize:14, color:"#5A5870" }}>
                  <span>{lang === "mr" ? "एकूण उत्पादने" : "Total Items"}</span>
                  <span style={{ fontWeight:700, color:"#0F0C29" }}>{items.reduce((s,i)=>s+i.qty, 0)}</span>
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:16, fontWeight:800, color:"#6C48F2", borderTop:"1px solid #E8E8F0", paddingTop:12, marginTop:4 }}>
                  <span>{lang === "mr" ? "अंदाजे रक्कम" : "Estimated Total"}</span>
                  <span>₹{(cartTotal/100).toLocaleString("en-IN")}</span>
                </div>
              </div>

              {orderMut.error && <p style={{color:"#EF4444",fontSize:13,textAlign:"center"}}>{(orderMut.error as Error).message}</p>}
            </div>
          )}

          {step === "success" && (
            <div style={{ textAlign:"center", padding:"40px 0" }}>
              <div style={{ fontSize:64, marginBottom:16 }}>🎉</div>
              <h3 style={{ fontSize:24, fontWeight:800, color:"#0F0C29", marginBottom:10 }}>
                {lang==="mr" ? "ऑर्डर नोंदणी झाली!" : "Order Placed Successfully!"}
              </h3>
              {orderId && <p style={{ fontSize:13, color:"#9896A8", marginBottom:16 }}>Order ID: #{orderId.slice(-8).toUpperCase()}</p>}
              <p style={{ fontSize:15, color:"#5A5870", lineHeight:1.6 }}>
                {lang==="mr"
                  ? `${name}, तुमची ऑर्डर स्वीकारली आहे. सप्लायर लवकरच संपर्क करतील.`
                  : `${name}, your order has been registered. The supplier will contact you soon.`}
              </p>
              
              {waLink && (
                <button onClick={()=>window.open(waLink,"_blank")} style={{ marginTop:24, width:"100%", padding:15, background:"#25D366", color:"#fff", border:"none", borderRadius:12, fontSize:15, fontWeight:800, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:10 }}>
                  <MessageCircle size={20}/>
                  {lang==="mr" ? "WhatsApp उघडा" : "Open WhatsApp Chat"}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {step === "cart" && items.length > 0 && (
          <div style={{ padding:"20px 24px", borderTop:"1px solid #E8E8F0", background:"#fff" }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:16, fontSize:18, fontWeight:800, color:"#0F0C29" }}>
              <span>{lang === "mr" ? "एकूण" : "Subtotal"}</span>
              <span style={{ color:"#6C48F2" }}>₹{(cartTotal/100).toLocaleString("en-IN")}</span>
            </div>
            <button onClick={()=>setStep("checkout")} style={{ width:"100%", padding:16, borderRadius:12, border:"none", background:"linear-gradient(135deg,#6C48F2,#D946EF)", color:"#fff", fontSize:16, fontWeight:800, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:10 }}>
              {lang === "mr" ? "चेकआउट करा" : "Proceed to Checkout"} <ArrowRight size={18} />
            </button>
          </div>
        )}

        {step === "checkout" && (
          <div style={{ padding:"20px 24px", borderTop:"1px solid #E8E8F0", background:"#fff" }}>
            <button onClick={() => orderMut.mutate()} disabled={!valid || orderMut.isPending} style={{ width:"100%", padding:16, borderRadius:12, border:"none", background:"linear-gradient(135deg,#6C48F2,#D946EF)", color:"#fff", fontSize:16, fontWeight:800, cursor:(!valid || orderMut.isPending)?"not-allowed":"pointer", opacity:(!valid || orderMut.isPending)?0.6:1, display:"flex", alignItems:"center", justifyContent:"center", gap:10 }}>
              {orderMut.isPending ? <Loader2 size={18} style={{animation:"spin .7s linear infinite"}}/> : <Check size={18} />}
              {orderMut.isPending ? (lang==="mr"?"नोंदणी होत आहे...":"Placing Order...") : (lang==="mr"?"ऑर्डर निश्चित करा":"Confirm Order")}
            </button>
            <button onClick={()=>setStep("cart")} style={{ width:"100%", padding:12, marginTop:8, background:"none", border:"none", color:"#9896A8", fontSize:14, fontWeight:600, cursor:"pointer" }}>
              {lang === "mr" ? "कार्ट वर परत जा" : "Back to Cart"}
            </button>
          </div>
        )}

        {step === "success" && (
          <div style={{ padding:"20px 24px" }}>
             <button onClick={close} style={{ width:"100%", padding:16, borderRadius:12, border:"1.5px solid #E8E8F0", background:"#fff", color:"#0F0C29", fontSize:15, fontWeight:700, cursor:"pointer" }}>
              {lang === "mr" ? "आणखी खरेदी करा" : "Continue Shopping"}
            </button>
          </div>
        )}
      </div>
    </>
  );
}

const lbl: React.CSSProperties = { display:"block", fontSize:12, fontWeight:700, color:"#0F0C29", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:6 };
const inp: React.CSSProperties = { width:"100%", padding:"12px 16px", borderRadius:10, border:"1.5px solid #E8E8F0", background:"#F8F9FC", fontFamily:"'Mukta',sans-serif", fontSize:15, color:"#0F0C29", outline:"none" };
