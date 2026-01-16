import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0500] text-center p-6 relative overflow-hidden">
      
      {/* Background Fire Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-600/10 blur-[140px] rounded-full" />

      <div className="relative z-10 backdrop-blur-md p-10 rounded-[2rem] border border-white/10 bg-white/[0.02] shadow-2xl">
        {/* Simplified solid heading with a glow effect instead of a gradient */}
        <h1 className="text-5xl font-black mb-4 text-orange-50 drop-shadow-[0_0_15px_rgba(255,165,0,0.4)]">
          🚫 Access Denied
        </h1>
        
        <p className="text-lg text-orange-100/50 max-w-sm mx-auto mb-10 tracking-tight">
          Your account role does not have permission to access this section of CredX.
        </p>
        
        <div className="flex flex-col items-center gap-5">
          {/* Glass Button */}
          <Link 
            href="/auth/signin" 
            className="w-full px-10 py-4 bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 border border-orange-500/30 backdrop-blur-xl rounded-2xl font-bold transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,125,32,0.2)] hover:border-orange-500/60"
          >
            Switch Account
          </Link>
          
          <Link 
            href="/" 
            className="text-orange-900/80 hover:text-orange-600 text-sm font-semibold uppercase tracking-widest transition-colors"
          >
            Return to Home
          </Link>
        </div>
      </div>

      {/* Subtle floor glow */}
      <div className="absolute bottom-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-500/50 to-transparent" />
    </div>
  );
}