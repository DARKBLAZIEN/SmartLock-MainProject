import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Hash, LockKeyhole, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { useFlow, FLOW_MODES, FLOW_STATUS } from "../../context/FlowContext";

export default function PickupAccess() {
  const [apartmentId, setApartmentId] = useState("");
  const [passcode, setPasscode] = useState("");
  const [showPasscode, setShowPasscode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();
  const { startFlow, updateFlow } = useFlow();

  const handleSubmit = async (e) => {
    e.preventDefault();

    startFlow(FLOW_MODES.PICKUP);
    updateFlow({ status: FLOW_STATUS.PROCESSING, apartmentId });
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/apartment/pickup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apartmentId, passcode }),
      });
      const data = await response.json();

      if (data.success) {
        updateFlow({
          status: FLOW_STATUS.SUCCESS,
          lockerId: data.lockerId,
          details: data
        });
        navigate("/pickup/status");
      } else {
        updateFlow({ status: FLOW_STATUS.ERROR, error: data.message });
        alert(data.message || "Access Denied");
      }
    } catch (err) {
      setError("Terminal offline. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 z-0 opacity-20"
        style={{ backgroundImage: `radial-gradient(circle at 2px 2px, #10b981 1px, transparent 0)`, backgroundSize: "40px 40px" }}
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
            <div className="inline-flex p-3 rounded-2xl mb-4 border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
              <ShieldCheck size={28} />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Auth Terminal</h1>
            <p className="text-slate-400 mt-2 font-medium">Clearance required for pickup</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Success Message */}
            {success && (
              <div className="flex items-start gap-2 bg-emerald-950/50 border border-emerald-700/50 text-emerald-300 rounded-xl px-4 py-3 text-sm">
                <ShieldCheck size={16} className="mt-0.5 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-2 bg-red-950/50 border border-red-700/50 text-red-300 rounded-xl px-4 py-3 text-sm">
                <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

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
                disabled={loading}
              />
            </div>

            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors">
                <LockKeyhole size={20} />
              </div>
              <input
                type={showPasscode ? "text" : "password"}
                placeholder="OTP (from email)"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="w-full pl-12 pr-12 py-4 rounded-2xl border border-white/5 bg-white/5 focus:bg-white/[0.08] focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-white text-lg font-medium tracking-[0.2em]"
                required
                disabled={loading}
                inputMode="numeric"
                maxLength={6}
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
              disabled={loading}
              className="group w-full py-4 mt-2 rounded-2xl bg-emerald-600 text-white font-semibold text-lg hover:bg-emerald-500 transition-all duration-300 shadow-lg shadow-emerald-900/20 hover:shadow-emerald-500/40 hover:-translate-y-1 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Verifying…
                </span>
              ) : "Request Access"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}