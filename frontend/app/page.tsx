import Link from 'next/link';
import Button from '@/components/Button';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-950 relative overflow-hidden isolate">
      {/* Background effects to match login page */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-soft-light"></div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px] pointer-events-none"></div>
      
      {/* Glow Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-125 h-125 bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-125 h-125 bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="max-w-3xl w-full text-center space-y-8 relative z-10">
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl scale-150 animate-pulse"></div>
            <img 
              src="/SES_logo.png" 
              alt="Socio-Economic Survey Logo" 
              className="w-32 h-32 md:w-40 md:h-40 relative z-10 drop-shadow-2xl hover:scale-105 transition-transform duration-300"
            />
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight">
            Socio-Economic Survey
          </h1>
        <div className="w-60 h-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full mx-auto"></div>
        </div>
        
        <p className="text-lg md:text-lg text-slate-400 max-w-lg mx-auto leading-relaxed">
          Advanced digital data collection system for large-scale demographic and infrastructure surveys.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/login">
            <Button variant="primary" size="lg" className="min-w-50 text-lg bg-linear-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 px-8 rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300">
              Login to System
            </Button>
          </Link>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700 backdrop-blur-xl transition-all hover:bg-slate-800/80 hover:border-slate-600">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-3 text-white">Secure</h3>
            <p className="text-slate-400">Role-based access control ensuring data integrity and security.</p>
          </div>
          <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700 backdrop-blur-xl transition-all hover:bg-slate-800/80 hover:border-slate-600">
            <div className="w-10 h-10 rounded-lg bg-teal-500/20 flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-teal-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-3 text-white">Efficient</h3>
            <p className="text-slate-400">Optimized for high-volume data collection with offline capabilities.</p>
          </div>
          <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700 backdrop-blur-xl transition-all hover:bg-slate-800/80 hover:border-slate-600">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-3 text-white">Comprehensive</h3>
            <p className="text-slate-400">Detailed slum and household level analytics and reporting.</p>
          </div>
        </div>
      </div>
    </div>
  );
}