import { Link } from "react-router-dom";
import { TrendingUp } from "lucide-react";

// REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
export function googleLogin() {
  const redirectUrl = window.location.origin + "/dashboard";
  window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
}

export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="min-h-screen flex bg-navy relative">
      <div className="grain" aria-hidden="true" />
      <div className="hidden lg:flex lg:w-1/2 relative border-r border-white/10 grid-lines">
        <img src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200"
          alt="Trading charts" className="absolute inset-0 w-full h-full object-cover opacity-20" />
        <div className="relative z-10 p-14 flex flex-col justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-emerald flex items-center justify-center"><TrendingUp className="w-5 h-5 text-navy" strokeWidth={2.5} /></div>
            <span className="font-heading text-lg font-extrabold">TradeAcademy</span>
          </Link>
          <div>
            <h2 className="font-heading text-4xl font-extrabold leading-tight mb-4">Learn the market.<br /><span className="text-emerald">Build real skills.</span></h2>
            <p className="text-slate-400 max-w-sm">Structured, practical stock market education — free to start, learn at your own pace.</p>
            <p className="text-xs text-slate-600 mt-8">Educational content only. Trading involves risk. No returns are guaranteed.</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-md">
          <Link to="/" className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-lg bg-emerald flex items-center justify-center"><TrendingUp className="w-5 h-5 text-navy" strokeWidth={2.5} /></div>
            <span className="font-heading text-lg font-extrabold">TradeAcademy</span>
          </Link>
          <h1 className="font-heading text-3xl font-extrabold mb-2">{title}</h1>
          <p className="text-slate-400 mb-8">{subtitle}</p>
          {children}
          <div className="mt-6 text-sm text-slate-400 text-center">{footer}</div>
        </div>
      </div>
    </div>
  );
}
