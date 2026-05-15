import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { getCropRecommendations } from "@/functions";
import { useState } from "react";
import { useI18n } from "@/lib/useI18n";
import { Leaf, ArrowRight, ShoppingBag, Sparkles } from "lucide-react";

export const Route = createFileRoute("/recommendations")({ component: RecommendationsPage });

const CROPS = ["Banana","Onion","Grapes","Mango","Pomegranate","Tomato","Sugarcane","Wheat"];
const DISTRICTS = ["Nashik","Pune","Sangli","Satara","Solapur","Aurangabad","Kolhapur","Jalgaon"];

const CROPS_MR: Record<string,string> = {
  Banana:"केळी", Onion:"कांदा", Grapes:"द्राक्ष", Mango:"आंबा",
  Pomegranate:"डाळिंब", Tomato:"टोमॅटो", Sugarcane:"ऊस", Wheat:"गहू",
};
const DISTRICTS_MR: Record<string,string> = {
  Nashik:"नाशिक", Pune:"पुणे", Sangli:"सांगली", Satara:"सातारा",
  Solapur:"सोलापूर", Aurangabad:"औरंगाबाद", Kolhapur:"कोल्हापूर", Jalgaon:"जळगाव",
};

function RecommendationsPage() {
  const [crop, setCrop]         = useState("");
  const [district, setDistrict] = useState("");
  const { t, lang } = useI18n();

  const { mutate, data, isPending, reset } = useMutation({
    mutationFn: (v: { crop: string; district?: string; lang: "en"|"mr" }) =>
      getCropRecommendations({ data: v }),
  });

  return (
    <div style={{ fontFamily: "'Mukta',sans-serif", minHeight: "100vh", background: "#F8F9FC" }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "48px 24px 80px" }}>

        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:8 }}>
          <div style={{ width:40,height:40,borderRadius:10,background:"linear-gradient(135deg,#6C48F2,#D946EF)", display:"flex",alignItems:"center",justifyContent:"center" }}>
            <Leaf size={20} color="#fff"/>
          </div>
          <span style={{ fontSize:11,fontWeight:700,color:"#6C48F2",textTransform:"uppercase",letterSpacing:"0.12em" }}>
            {t("recommendations.tag")}
          </span>
        </div>
        <h1 style={{ fontSize:"clamp(28px,5vw,44px)",fontWeight:800,color:"#0F0C29",marginBottom:10 }}>
          {t("recommendations.title")}
        </h1>
        <p style={{ fontSize:15,color:"#5A5870",marginBottom:40,lineHeight:1.6 }}>
          {lang==="mr"
            ? "तुमचे पीक निवडा — AI तुम्हाला योग्य शेती साहित्याच्या शिफारसी देईल."
            : "Select your crop and get AI-powered recommendations for the right farm inputs."}
        </p>

        {/* Form card */}
        <div style={{ background:"#fff",borderRadius:16,border:"1.5px solid #E8E8F0",padding:28,marginBottom:28 }}>
          <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
            <div>
              <label style={{ display:"block",fontSize:12,fontWeight:700,color:"#0F0C29",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8 }}>
                {lang==="mr" ? "तुमचे पीक *" : "Your Crop *"}
              </label>
              <select value={crop} onChange={e=>{ setCrop(e.target.value); reset(); }}
                style={{ width:"100%",padding:"13px 16px",borderRadius:10,border:"1.5px solid #E8E8F0",background:"#F8F9FC",fontSize:15,color:crop?"#0F0C29":"#9896A8",fontFamily:"'Mukta',sans-serif",outline:"none" }}>
                <option value="">{t("recommendations.selectCropPlaceholder")}</option>
                {CROPS.map(c => <option key={c} value={c.toLowerCase()}>{lang==="mr" ? CROPS_MR[c] : c}</option>)}
              </select>
            </div>

            <div>
              <label style={{ display:"block",fontSize:12,fontWeight:700,color:"#0F0C29",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8 }}>
                {lang==="mr" ? "जिल्हा (पर्यायी)" : "District (optional)"}
              </label>
              <select value={district} onChange={e=>{ setDistrict(e.target.value); reset(); }}
                style={{ width:"100%",padding:"13px 16px",borderRadius:10,border:"1.5px solid #E8E8F0",background:"#F8F9FC",fontSize:15,color:district?"#0F0C29":"#9896A8",fontFamily:"'Mukta',sans-serif",outline:"none" }}>
                <option value="">{t("recommendations.selectDistrictPlaceholder")}</option>
                {DISTRICTS.map(d => <option key={d} value={d}>{lang==="mr" ? DISTRICTS_MR[d] : d}</option>)}
              </select>
            </div>

            <button
              disabled={!crop || isPending}
              onClick={() => mutate({ crop, district: district||undefined, lang: lang as "en"|"mr" })}
              style={{ padding:"14px",borderRadius:12,border:"none",background: !crop ? "#E8E8F0" : "linear-gradient(135deg,#6C48F2,#D946EF)",color: !crop ? "#9896A8" : "#fff",fontSize:15,fontWeight:800,cursor: crop?"pointer":"not-allowed",display:"flex",alignItems:"center",justifyContent:"center",gap:10,transition:"opacity .2s" }}
            >
              {isPending
                ? <><span style={{ width:18,height:18,border:"2.5px solid rgba(255,255,255,.4)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin .7s linear infinite",display:"inline-block" }}/> {t("recommendations.getting")}</>
                : <><Sparkles size={16}/> {t("recommendations.getRecommendations")}</>
              }
            </button>
          </div>
        </div>

        {/* Results */}
        {data && data.length > 0 && (
          <div>
            <div style={{ fontWeight:700,color:"#0F0C29",marginBottom:16,fontSize:16 }}>
              {lang==="mr" ? `${CROPS_MR[crop] || crop} साठी शिफारसी:` : `Recommendations for ${crop}:`}
            </div>
            <div style={{ display:"flex",flexDirection:"column",gap:12,marginBottom:28 }}>
              {data.map((rec: {category:string;product_name:string;reason:string}, i:number) => (
                <div key={i} style={{ background:"#fff",border:"1.5px solid #E8E8F0",borderRadius:12,padding:20,display:"flex",gap:16 }}>
                  <div style={{ width:36,height:36,borderRadius:8,background:"rgba(108,72,242,0.1)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                    <Leaf size={16} style={{ color:"#6C48F2" }}/>
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:8,marginBottom:6,flexWrap:"wrap" }}>
                      <span style={{ fontWeight:700,fontSize:15,color:"#0F0C29" }}>{rec.product_name}</span>
                      <span style={{ fontSize:10,fontWeight:700,color:"#6C48F2",background:"rgba(108,72,242,0.1)",padding:"3px 10px",borderRadius:100,textTransform:"uppercase",letterSpacing:"0.08em",flexShrink:0 }}>{rec.category}</span>
                    </div>
                    <p style={{ fontSize:13,color:"#5A5870",lineHeight:1.6 }}>{rec.reason}</p>
                  </div>
                </div>
              ))}
            </div>
            <a href={`/products?crop=${crop}`}
              style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:10,padding:"15px",borderRadius:12,background:"linear-gradient(135deg,#6C48F2,#D946EF)",color:"#fff",fontWeight:800,fontSize:15,textDecoration:"none" }}>
              <ShoppingBag size={18}/> {t("recommendations.shopProducts")} <ArrowRight size={16}/>
            </a>
          </div>
        )}

        {data && data.length === 0 && (
          <div style={{ textAlign:"center",padding:"40px 24px",color:"#9896A8",fontSize:15 }}>
            {lang==="mr" ? "या पिकासाठी शिफारसी उपलब्ध नाहीत." : "No recommendations found for this crop."}
          </div>
        )}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
