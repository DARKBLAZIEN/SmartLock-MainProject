import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Hash, User, Mail, UserPlus, CheckCircle, AlertTriangle } from "lucide-react";

export default function RegisterAccess() {
  const [apartmentId, setApartmentId] = useState("");
  const [nameOfOwner, setNameOfOwner] = useState("");
  const [gmail, setGmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/apartment/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ apartmentId, nameOfOwner, gmail }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Registration failed. Please try again.");
        return;
      }

      setSuccess(`Resident registered successfully for Unit ${apartmentId}.`);
      setApartmentId("");
      setNameOfOwner("");
      setGmail("");
    } catch (err) {
      console.error("Register error:", err);
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden">
      {/* Technical Grid Layer */}
      <div
        className="absolute inset-0 z-0 opacity-20"
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, #4f46e5 1px, transparent 0)`,
          backgroundSize: "40px 40px",
        }}
      />
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-violet-600/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] animate-pulse delay-700" />

      <div className="w-full max-w-md mx-4 z-10">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-slate-500 hover:text-indigo-400 transition-colors font-medium group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Cancel
        </button>

        <div className="bg-slate-900/40 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 p-10 relative shadow-2xl">
          {/* Top shimmer */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

          <div className="text-center mb-10">
            <div className="inline-flex p-3 rounded-2xl bg-violet-500/10 text-violet-400 mb-4 border border-violet-500/20">
              <UserPlus size={28} />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Register Resident</h1>
            <p className="text-slate-400 mt-2">Add a new resident to the system</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Success Message */}
            {success && (
              <div className="flex items-start gap-2 bg-emerald-950/50 border border-emerald-700/50 text-emerald-300 rounded-xl px-4 py-3 text-sm">
                <CheckCircle size={16} className="mt-0.5 shrink-0" />
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

            {/* Apartment ID */}
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-violet-400 transition-colors">
                <Hash size={20} />
              </div>
              <input
                type="text"
                placeholder="Apartment / Unit ID"
                value={apartmentId}
                onChange={(e) => setApartmentId(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-white/5 bg-white/5 focus:bg-white/[0.08] focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all text-white text-lg font-medium"
                required
                disabled={loading}
              />
            </div>

            {/* Resident Name */}
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-violet-400 transition-colors">
                <User size={20} />
              </div>
              <input
                type="text"
                placeholder="Resident Full Name"
                value={nameOfOwner}
                onChange={(e) => setNameOfOwner(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-white/5 bg-white/5 focus:bg-white/[0.08] focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all text-white text-lg font-medium"
                required
                disabled={loading}
              />
            </div>

            {/* Email */}
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-violet-400 transition-colors">
                <Mail size={20} />
              </div>
              <input
                type="email"
                placeholder="Gmail Address"
                value={gmail}
                onChange={(e) => setGmail(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-white/5 bg-white/5 focus:bg-white/[0.08] focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all text-white text-lg font-medium"
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group w-full py-4 rounded-2xl bg-violet-600 text-white font-semibold text-lg hover:bg-violet-500 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-violet-900/20 hover:shadow-violet-500/40 hover:-translate-y-1 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Registering…
                </span>
              ) : (
                <>
                  Register Resident
                  <UserPlus size={20} className="group-hover:scale-110 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
