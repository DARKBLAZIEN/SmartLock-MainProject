import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Hash, LockKeyhole, Eye, EyeOff, ShieldCheck } from "lucide-react";

export default function PickupAccess() {
  const [apartmentId, setApartmentId] = useState("");
  const [passcode, setPasscode] = useState("");
  const [showPasscode, setShowPasscode] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch("http://localhost:5000/api/apartment/pickup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apartmentId, passcode }),
      });

      const data = await response.json();

      if (data.success) {
        alert(data.message);
        navigate("/"); // Go back to start
      } else {
        alert(data.message || "Access Denied");
      }
    } catch (error) {
      console.error("Pickup fetch error:", error);
      alert("Terminal Offline. Try again later.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden">
      {/* Technical Grid Layer */}
      <div 
        className="absolute inset-0 z-0 opacity-20"
        style={{ backgroundImage: `radial-gradient(circle at 2px 2px, #10b981 1px, transparent 0)`, backgroundSize: '40px 40px' }}
      />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-emerald-600/10 rounded-full blur-[120px] animate-pulse" />

      <div className="w-full max-w-md mx-4 z-10">
        <button 
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-slate-500 hover:text-emerald-400 transition-colors font-medium group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Abort Access
        </button>

        <div className="bg-slate-900/40 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 p-10 shadow-2xl">
          <div className="text-center mb-10">
            <div className="inline-flex p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 mb-4 border border-emerald-500/20">
              <ShieldCheck size={28} />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Auth Terminal</h1>
            <p className="text-slate-400 mt-2 font-medium">Clearance required for pickup</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors">
                <Hash size={20} />
              </div>
              <input
                type="text"
                placeholder="Apartment ID"
                value={apartmentId}
                onChange={(e) => setApartmentId(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-white/5 bg-white/5 focus:bg-white/[0.08] focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-white text-lg font-medium"
                required
              />
            </div>

            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors">
                <LockKeyhole size={20} />
              </div>
              <input
                type={showPasscode ? "text" : "password"}
                placeholder="Auth Code"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="w-full pl-12 pr-12 py-4 rounded-2xl border border-white/5 bg-white/5 focus:bg-white/[0.08] focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-white text-lg font-medium tracking-[0.2em]"
                required
              />
              <button
                type="button"
                onClick={() => setShowPasscode(!showPasscode)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
              >
                {showPasscode ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <button
              type="submit"
              className="group w-full py-4 mt-2 rounded-2xl bg-emerald-600 text-white font-semibold text-lg hover:bg-emerald-500 transition-all duration-300 shadow-lg shadow-emerald-900/20 hover:shadow-emerald-500/40 hover:-translate-y-1"
            >
              Request Access
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}