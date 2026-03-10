import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, UserPlus, ArrowRight, Mail, Hash, User, ShieldCheck, KeyRound } from "lucide-react";

export default function RegisterAccess() {
    const [step, setStep] = useState(1); // 1: Info, 2: Verification
    const [formData, setFormData] = useState({
        nameOfOwner: "",
        gmail: "",
        apartmentId: "",
        otp: ""
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSendOTP = async (e, isResend = false) => {
        if (e) e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch(
                "http://localhost:5000/api/apartment/register-otp",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ gmail: formData.gmail }),
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                alert(data.message || "Failed to send OTP");
                return;
            }

            alert(isResend ? "New OTP sent!" : "OTP sent to your email!");
            if (!isResend) setStep(2);

        } catch (error) {
            console.error("OTP error:", error);
            alert("Server error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleFinalSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch(
                "http://localhost:5000/api/apartment/register",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                alert(data.message || "Registration failed");
                return;
            }

            alert("Success! You have been registered.");
            navigate("/access");

        } catch (error) {
            console.error("Registration error:", error);
            alert("Server error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden">
            {/* Technical Grid Layer */}
            <div
                className="absolute inset-0 z-0 opacity-20"
                style={{ backgroundImage: `radial-gradient(circle at 2px 2px, #4f46e5 1px, transparent 0)`, backgroundSize: '40px 40px' }}
            />
            <div className={`absolute top-1/4 -left-20 w-96 h-96 ${step === 1 ? 'bg-blue-600/10' : 'bg-emerald-600/10'} rounded-full blur-[120px] animate-pulse`} />

            <div className="w-full max-w-md mx-4 z-10">
                <button
                    onClick={() => step === 1 ? navigate(-1) : setStep(1)}
                    className="mb-6 flex items-center gap-2 text-slate-500 hover:text-blue-400 transition-colors font-medium group"
                >
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    {step === 1 ? "Go Back" : "Change Details"}
                </button>

                <div className="bg-slate-900/40 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 p-10 relative shadow-2xl">
                    <div className="text-center mb-10">
                        <div className={`inline-flex p-3 rounded-2xl ${step === 1 ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'} mb-4 border`}>
                            {step === 1 ? <UserPlus size={28} /> : <ShieldCheck size={28} />}
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-white">
                            {step === 1 ? "Resident Signup" : "Verify Email"}
                        </h1>
                        <p className="text-slate-400 mt-2">
                            {step === 1 ? "Register your apartment access" : `Enter the code sent to ${formData.gmail}`}
                        </p>
                    </div>

                    {step === 1 ? (
                        <form onSubmit={handleSendOTP} className="space-y-4">
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors">
                                    <User size={20} />
                                </div>
                                <input
                                    type="text"
                                    name="nameOfOwner"
                                    placeholder="Full Name"
                                    value={formData.nameOfOwner}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-white/5 bg-white/5 focus:bg-white/[0.08] focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-white text-lg font-medium"
                                    required
                                />
                            </div>

                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors">
                                    <Mail size={20} />
                                </div>
                                <input
                                    type="email"
                                    name="gmail"
                                    placeholder="Email Address"
                                    value={formData.gmail}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-white/5 bg-white/5 focus:bg-white/[0.08] focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-white text-lg font-medium"
                                    required
                                />
                            </div>

                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors">
                                    <Hash size={20} />
                                </div>
                                <input
                                    type="text"
                                    name="apartmentId"
                                    placeholder="Apartment ID (e.g. 101)"
                                    value={formData.apartmentId}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-white/5 bg-white/5 focus:bg-white/[0.08] focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-white text-lg font-medium"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="group w-full mt-4 py-4 rounded-2xl bg-blue-600 text-white font-semibold text-lg hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20 hover:shadow-blue-500/40 hover:-translate-y-1"
                            >
                                {loading ? "Sending OTP..." : "Continue"}
                                {!loading && <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleFinalSubmit} className="space-y-4">
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors">
                                    <Hash size={20} />
                                </div>
                                <input
                                    type="text"
                                    name="otp"
                                    placeholder="6-Digit Email OTP"
                                    value={formData.otp}
                                    onChange={handleChange}
                                    maxLength={6}
                                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-white/5 bg-white/5 focus:bg-white/[0.08] focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-white text-lg font-medium tracking-widest text-center"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="group w-full mt-4 py-4 rounded-2xl bg-emerald-600 text-white font-semibold text-lg hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20 hover:shadow-emerald-500/40 hover:-translate-y-1"
                            >
                                {loading ? "Verifying..." : "Complete Registration"}
                                {!loading && <ShieldCheck size={20} className="group-hover:scale-110 transition-transform" />}
                            </button>

                            <p className="text-center text-sm text-slate-500 mt-4">
                                Didn't get a code?{" "}
                                <button
                                    type="button"
                                    disabled={loading}
                                    onClick={() => handleSendOTP(null, true)}
                                    className="text-emerald-400 hover:underline disabled:opacity-50 disabled:no-underline"
                                >
                                    {loading ? "Resending..." : "Resend"}
                                </button>
                            </p>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
