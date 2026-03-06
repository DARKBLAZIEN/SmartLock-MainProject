import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Hash, ArrowRight, Package } from "lucide-react";

export default function DeliveryAccess() {
  const [apartmentId, setApartmentId] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const response = await fetch(
      "http://localhost:5000/api/apartment/delivery",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apartmentId }),
      }
    );

    const data = await response.json();

    // 1. Check for success instead of .exists
    if (!response.ok || !data.success) {
      alert(data.message || "Apartment ID not found");
      return;
    }

    // 2. The Confirmation logic
    // Now that the email is ALREADY sent, we show the success state
    alert(`Success! Package for ${data.nameOfOwner} placed in Locker ${data.lockerId}. Email sent.`);
    
    // Optional: Navigate back to home after success
    // navigate("/");

  } catch (error) {
    console.error("Delivery access error:", error);
    alert("Server error. Please try again.");
  }
};


  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden">
      {/* Technical Grid Layer */}
      <div 
        className="absolute inset-0 z-0 opacity-20"
        style={{ backgroundImage: `radial-gradient(circle at 2px 2px, #4f46e5 1px, transparent 0)`, backgroundSize: '40px 40px' }}
      />
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] animate-pulse" />

      <div className="w-full max-w-md mx-4 z-10">
        <button 
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-slate-500 hover:text-indigo-400 transition-colors font-medium group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Cancel Operation
        </button>

        <div className="bg-slate-900/40 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 p-10 relative shadow-2xl">
          <div className="text-center mb-10">
             <div className="inline-flex p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 mb-4 border border-indigo-500/20">
              <Package size={28} />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Apartment ID</h1>
            <p className="text-slate-400 mt-2">Identify the destination unit</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                <Hash size={20} />
              </div>
              <input
                type="text"
                placeholder="Unit Number"
                value={apartmentId}
                onChange={(e) => setApartmentId(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-white/5 bg-white/5 focus:bg-white/[0.08] focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-white text-lg font-medium"
                required
              />
            </div>

            <button
              type="submit"
              className="group w-full py-4 rounded-2xl bg-indigo-600 text-white font-semibold text-lg hover:bg-indigo-500 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/20 hover:shadow-indigo-500/40 hover:-translate-y-1"
            >
              Open Locker
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}