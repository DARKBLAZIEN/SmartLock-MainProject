import React from "react";
import { useNavigate } from "react-router-dom";
import { Package, KeyRound, ChevronRight, ShieldCheck } from "lucide-react";

export default function AccessChoice() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden">
      {/* 1. The Technical Grid Layer */}
      <div 
        className="absolute inset-0 z-0 opacity-20"
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, #4f46e5 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}
      />

      {/* 2. Animated Security Glows */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-emerald-600/10 rounded-full blur-[120px] animate-pulse delay-700" />

      <div className="w-full max-w-md mx-4 z-10">
        <div className="bg-slate-900/40 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] border border-white/10 p-10 relative overflow-hidden">
          
          {/* Subtle top light reflection */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

          <div className="text-center mb-10">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                <ShieldCheck size={32} />
              </div>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Smart Access
            </h1>
            <p className="text-slate-400 mt-2 font-medium">
              Select your entry method
            </p>
          </div>

          <div className="space-y-4">
            {/* Delivery Button - Dark Aesthetic */}
            <button
              onClick={() => navigate("/access/delivery")}
              className="group w-full p-5 rounded-3xl bg-white/[0.03] border border-white/5 hover:border-indigo-500/50 transition-all duration-500 flex items-center gap-4 text-left hover:bg-white/[0.06] hover:shadow-[0_0_20px_rgba(79,70,229,0.15)]"
            >
              <div className="p-3 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform duration-500">
                <Package size={24} />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-white text-lg tracking-wide">Delivery</p>
                <p className="text-sm text-slate-400 leading-tight">
                  Log a drop-off
                </p>
              </div>
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 group-hover:bg-indigo-600 transition-colors">
                <ChevronRight className="text-slate-500 group-hover:text-white" size={18} />
              </div>
            </button>

            {/* Pickup Button - Glass Aesthetic */}
            <button
              onClick={() => navigate("/access/pickup")}
              className="group w-full p-5 rounded-3xl bg-white/[0.03] border border-white/5 hover:border-emerald-500/50 transition-all duration-500 flex items-center gap-4 text-left hover:bg-white/[0.06] hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]"
            >
              <div className="p-3 rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform duration-500">
                <KeyRound size={24} />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-white text-lg tracking-wide">Pickup</p>
                <p className="text-sm text-slate-400 leading-tight">
                  Enter access code
                </p>
              </div>
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 group-hover:bg-emerald-600 transition-colors">
                <ChevronRight className="text-slate-500 group-hover:text-white" size={18} />
              </div>
            </button>
          </div>

          <div className="mt-10 flex flex-col items-center gap-2">
            <div className="h-px w-12 bg-indigo-500/30" />
            <p className="text-xs text-slate-500 uppercase tracking-[0.3em] font-bold">
              Secure Terminal
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}