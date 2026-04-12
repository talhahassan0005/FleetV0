"use client";
// src/app/register/page.tsx
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();

  const [role, setRole] = useState<"CLIENT" | "TRANSPORTER">("CLIENT");
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("role", role);
      formData.append("companyName", companyName);
      formData.append("contactName", contactName);
      formData.append("phone", phone);
      formData.append("email", email);
      formData.append("password", password);

      const res = await fetch("/api/auth/register", {
        method: "POST",
        body: formData,
      });
      setLoading(false);
      if (!res.ok) {
        const d = await res.json();
        setError(d.error?.toString() ?? "Registration failed.");
        return;
      }

      // Show success toast
      setSuccess(true);
      setTimeout(() => {
        router.push("/login?registered=1");
      }, 2000);
    } catch (err) {
      setLoading(false);
      setError("Server error. Please try again.");
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden" suppressHydrationWarning style={{
      backgroundImage: 'url("/registerpagebackground.png")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed'
    }}>
      {/* Light Overlay for Modern Bright Scene */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/12 via-white/8 to-transparent" />
      
      {/* Animated Background Elements - Light Theme */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" suppressHydrationWarning>
        {/* Orb 1 - Green Accent */}
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-br from-[#3ab54a]/15 to-transparent rounded-full filter blur-3xl opacity-40" style={{animation: 'float 8s ease-in-out infinite'}} />
        
        {/* Orb 2 - Blue Accent */}
        <div className="absolute bottom-32 right-20 w-80 h-80 bg-gradient-to-br from-blue-400/12 to-transparent rounded-full filter blur-3xl opacity-30" style={{animation: 'float 10s ease-in-out infinite 1s'}} />
        
        {/* Orb 3 - Accent Green */}
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-gradient-to-br from-[#3ab54a]/10 to-transparent rounded-full filter blur-3xl opacity-25" style={{animation: 'float 12s ease-in-out infinite 2s'}} />
      </div>

      {/* Back Button - Green to match branding */}
      <Link
        href="/"
        className="absolute top-6 left-6 z-50 inline-flex items-center justify-center w-11 h-11 rounded-full bg-[#3ab54a] hover:bg-[#2d9e3c] transition-all duration-300 group shadow-lg hover:shadow-[0_0_20px_rgba(58,181,74,0.6)] hover:scale-110 active:scale-95" 
        style={{animation: 'bobbing 3s ease-in-out infinite'}}
      >
        <ArrowLeft className="w-5 h-5 text-white group-hover:scale-110 transition-transform duration-300" />
      </Link>

      {/* Main Content Container - Enhanced Width */}
      <div className="relative z-10 w-full max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Logo with Branding Glow */}
        <div className="text-center mb-12">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-gradient-to-r from-[#3ab54a]/30 to-blue-500/20 blur-3xl rounded-full" style={{animation: 'logoGlow 3s ease-in-out infinite'}} />
            <div className="absolute -inset-2 bg-gradient-to-r from-[#3ab54a]/15 to-blue-400/10 blur-2xl rounded-full" style={{animation: 'logoPulse 4s ease-in-out infinite'}} />
            <Image src="/images/logo.png" alt="FleetXchange - Africa's Largest Freight Hub" width={200} height={60} className="h-16 w-auto mx-auto mb-4 relative z-10" style={{animation: 'logoPulse 2.5s ease-in-out infinite'}} priority />
          </div>
          <p className="text-sm text-[#3ab54a] font-medium tracking-wider animate-in fade-in duration-700" style={{animationDelay: '0.7s'}}>Every load has a story. We are telling it</p>
        </div>

        {/* Card with Modern Light Glass Styling */}
        <div className="bg-white/80 backdrop-blur-3xl rounded-3xl shadow-2xl border-2 border-white/50 p-10 transition-all duration-300 relative" style={{animation: 'cardGlow 3s ease-in-out infinite', boxShadow: '0 20px 50px rgba(0,0,0,0.12), 0 0 40px rgba(58,181,74,0.1)'}}>    
          {/* Modern border glow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-[#3ab54a]/25 via-blue-400/15 to-[#3ab54a]/20 rounded-3xl -z-10" style={{animation: 'borderGlow 3s ease-in-out infinite'}} />
          
          <h2 className="font-condensed font-bold text-4xl bg-gradient-to-r from-slate-900 via-slate-800 to-[#3ab54a] bg-clip-text text-transparent uppercase tracking-wider mb-3 animate-in fade-in duration-500 relative" style={{animationDelay: '0.1s'}}>
            Create Account
          </h2>
          <div className="h-0.5 w-16 bg-gradient-to-r from-[#3ab54a] to-blue-500 mx-auto mb-6 animate-in scale-x-0 duration-500" style={{animationDelay: '0.12s', animation: 'scaleIn 0.5s ease-out 0.12s forwards'}} />
          <p className="text-center text-sm text-slate-600 mb-8 animate-in fade-in duration-500 font-light" style={{animationDelay: '0.15s'}}>Join Africa's largest freight network</p>

          {error && (
            <div className="mb-4 p-4 bg-red-100/80 border border-red-300 border-l-4 border-l-red-600 rounded-lg text-red-700 text-sm animate-in shake duration-500 flex items-start gap-3">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Role Picker */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-800 mb-3 uppercase tracking-widest">
              I am a...
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(["CLIENT", "TRANSPORTER"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`p-4 rounded-lg border-2 text-center transition-all duration-300 animate-in fade-in duration-500 ${role === r ? "border-[#3ab54a] bg-[#3ab54a]/15 shadow-lg shadow-[#3ab54a]/30" : "border-slate-300 hover:border-[#3ab54a]/70 bg-white/60 hover:bg-white/80"}`}
                  style={{animationDelay: `${0.2 + (r === "CLIENT" ? 0 : 0.1)}s`}}
                >
                  <div className="mb-4 inline-block" style={{animation: role === r ? 'bounceIcon 0.6s ease-in-out infinite' : 'floatIcon 3s ease-in-out infinite'}}>
                    {r === "CLIENT" ? (
                      <svg className="w-12 h-12 text-[#3ab54a]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M3 3h18v16H3z" />
                        <path d="M7 9h10" />
                        <path d="M7 13h10" />
                        <path d="M7 17h6" />
                        <path d="M12 19v2" />
                        <path d="M8 19v2" />
                        <path d="M16 19v2" />
                      </svg>
                    ) : (
                      <svg className="w-12 h-12 text-[#3ab54a]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M2 7h20v10H2z" />
                        <path d="M6 17v2" />
                        <path d="M18 17v2" />
                        <path d="M2 7l2-3h16l2 3" />
                        <path d="M8 11h8" />
                      </svg>
                    )}
                  </div>
                  <div className="font-bold text-sm text-slate-800">
                    {r === "CLIENT" ? "Client / Shipper" : "Transporter"}
                  </div>
                  <div className="text-xs text-slate-600 mt-1">
                    {r === "CLIENT"
                      ? "I need to move cargo"
                      : "I have trucks available"}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Company & Contact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="animate-in fade-in duration-500" style={{animationDelay: '0.25s'}}>
                <label className="block text-sm font-semibold text-slate-800 mb-2 transition-all duration-200" style={{animation: 'labelGlow 2s ease-in-out infinite', animationDelay: '0.3s'}}>Company Name *</label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#3ab54a]/0 via-[#3ab54a]/15 to-[#3ab54a]/0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none blur-sm" />
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="relative w-full px-4 py-3 rounded-lg border-2 border-slate-400 hover:border-[#3ab54a]/80 focus:border-[#3ab54a] focus:outline-none focus:ring-2 focus:ring-[#3ab54a]/40 transition-all duration-300 placeholder:text-slate-500 bg-white/85 backdrop-blur-sm text-slate-900 font-medium" 
                    placeholder="Your company name"
                  />
                </div>
              </div>
              <div className="animate-in fade-in duration-500" style={{animationDelay: '0.3s'}}>
                <label className="block text-sm font-semibold text-slate-800 mb-2 transition-all duration-200" style={{animation: 'labelGlow 2s ease-in-out infinite', animationDelay: '0.35s'}}>Contact Person</label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#3ab54a]/0 via-[#3ab54a]/15 to-[#3ab54a]/0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none blur-sm" />
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="relative w-full px-4 py-3 rounded-lg border-2 border-slate-400 hover:border-[#3ab54a]/80 focus:border-[#3ab54a] focus:outline-none focus:ring-2 focus:ring-[#3ab54a]/40 transition-all duration-300 placeholder:text-slate-500 bg-white/85 backdrop-blur-sm text-slate-900 font-medium" 
                    placeholder="Full name"
                  />
                </div>
              </div>
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="animate-in fade-in duration-500" style={{animationDelay: '0.35s'}}>
                <label className="block text-sm font-semibold text-slate-800 mb-2 transition-all duration-200" style={{animation: 'labelGlow 2s ease-in-out infinite', animationDelay: '0.4s'}}>Email Address *</label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#3ab54a]/0 via-[#3ab54a]/15 to-[#3ab54a]/0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none blur-sm" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="relative w-full px-4 py-3 rounded-lg border-2 border-slate-400 hover:border-[#3ab54a]/80 focus:border-[#3ab54a] focus:outline-none focus:ring-2 focus:ring-[#3ab54a]/40 transition-all duration-300 placeholder:text-slate-500 bg-white/85 backdrop-blur-sm text-slate-900 font-medium" 
                    placeholder="you@company.com"
                  />
                </div>
              </div>
              <div className="animate-in fade-in duration-500" style={{animationDelay: '0.4s'}}>
                <label className="block text-sm font-semibold text-slate-800 mb-2 transition-all duration-200" style={{animation: 'labelGlow 2s ease-in-out infinite', animationDelay: '0.45s'}}>Phone / WhatsApp</label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#3ab54a]/0 via-[#3ab54a]/15 to-[#3ab54a]/0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none blur-sm" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="relative w-full px-4 py-3 rounded-lg border-2 border-slate-400 hover:border-[#3ab54a]/80 focus:border-[#3ab54a] focus:outline-none focus:ring-2 focus:ring-[#3ab54a]/40 transition-all duration-300 placeholder:text-slate-500 bg-white/85 backdrop-blur-sm text-slate-900 font-medium" 
                    placeholder="+27..."
                  />
                </div>
              </div>
            </div>

            {/* Password */}
            <div className="animate-in fade-in duration-500" style={{animationDelay: '0.45s'}}>
              <label className="block text-sm font-semibold text-slate-800 mb-2 transition-all duration-200" style={{animation: 'labelGlow 2s ease-in-out infinite', animationDelay: '0.5s'}}>
                Password (minimum 6 characters) *
              </label>
              <div className="relative flex items-center group">
                <div className="absolute inset-0 bg-gradient-to-r from-[#3ab54a]/0 via-[#3ab54a]/15 to-[#3ab54a]/0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none blur-sm" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="relative w-full px-4 py-3 pr-12 rounded-lg border-2 border-slate-400 hover:border-[#3ab54a]/80 focus:border-[#3ab54a] focus:outline-none focus:ring-2 focus:ring-[#3ab54a]/40 transition-all duration-300 placeholder:text-slate-500 bg-white/85 backdrop-blur-sm text-slate-900 font-medium"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 inline-flex items-center justify-center p-2 rounded-lg text-[#3ab54a] hover:text-[#2d9e3c] hover:bg-[#3ab54a]/15 transition-all duration-200 active:scale-90"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path
                        fillRule="evenodd"
                        d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                        clipRule="evenodd"
                      />
                      <path d="M15.171 11.586a4 4 0 111.414-1.414l2.829 2.829a1 1 0 11-1.414 1.414l-2.83-2.83z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Create Account Button with Dynamic Glow */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-[#3ab54a] via-[#35a140] to-[#2d9e3c] hover:from-[#2d9e3c] hover:via-[#2a8c35] hover:to-[#1f7a2a] text-white font-bold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-condensed text-base uppercase tracking-widest shadow-lg hover:shadow-2xl active:scale-95 disabled:scale-100 animate-in fade-in duration-500 relative overflow-hidden border border-[#3ab54a]/50" style={{animationDelay: '0.5s', animation: 'buttonGlow 2s ease-in-out infinite', boxShadow: '0 8px 25px rgba(58,181,74,0.35), 0 0 20px rgba(58,181,74,0.2)'}}
            >
              <div className="flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Creating account…
                  </>
                ) : (
                  'Create Account'
                )}
              </div>
            </button>
          </form>

          {/* Sign in Link */}
          <p className="mt-8 text-center text-sm text-slate-700 animate-in fade-in duration-500" style={{animationDelay: '0.6s'}}>
            Already have an account?{' '}
            <Link
              href="/login"
              className="text-[#3ab54a] font-bold hover:text-[#2d9e3c] transition-all duration-200"
            >
              Sign in here
            </Link>
          </p>
        </div>

        {/* Footer Branding */}
        <div className="text-center mt-10 animate-in fade-in duration-500" style={{animationDelay: '0.7s'}}>
          <p className="text-xs text-slate-600 flex items-center justify-center gap-1 font-medium">
            <span className="w-1 h-1 rounded-full bg-[#3ab54a]/70"></span>
            Every load has a story. We are telling it
            <span className="w-1 h-1 rounded-full bg-[#3ab54a]/70"></span>
          </p>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -30px) scale(1.05); }
          66% { transform: translate(-20px, 20px) scale(0.95); }
        }

        @keyframes gridShift {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }

        @keyframes glowPulse {
          0%, 100% { opacity: 0.5; filter: blur(40px); }
          50% { opacity: 1; filter: blur(60px); }
        }

        @keyframes logoGlow {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.1); }
        }

        @keyframes logoPulse {
          0%, 100% { transform: scale(1) rotate(0deg); opacity: 1; }
          50% { transform: scale(1.08) rotate(2deg); opacity: 0.9; }
        }

        @keyframes bobbing {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          75% { transform: translateX(8px); }
        }

        @keyframes cardGlow {
          0%, 100% { box-shadow: 0 15px 40px rgba(0,0,0,0.1), 0 0 35px rgba(58,181,74,0.12); }
          50% { box-shadow: 0 20px 50px rgba(0,0,0,0.12), 0 0 45px rgba(58,181,74,0.2); }
        }

        @keyframes borderGlow {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }

        @keyframes labelGlow {
          0%, 100% { color: rgb(30,41,59); text-shadow: none; }
          50% { color: #3ab54a; text-shadow: 0 0 8px rgba(58,181,74,0.3); }
        }

        @keyframes scaleIn {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }

        @keyframes buttonGlow {
          0%, 100% { box-shadow: 0 8px 20px rgba(58,181,74,0.35), 0 0 0 0px rgba(58,181,74,0.25); }
          50% { box-shadow: 0 12px 30px rgba(58,181,74,0.5), 0 0 25px 5px rgba(58,181,74,0.35); }
        }

        @keyframes bounceIcon {
          0%, 100% { transform: scale(1) translateY(0); }
          50% { transform: scale(1.15) translateY(-8px); }
        }

        @keyframes floatIcon {
          0%, 100% { transform: translateY(0px); opacity: 0.7; }
          50% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
