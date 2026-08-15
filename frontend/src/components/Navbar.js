import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, TrendingUp, LayoutDashboard, LogOut, User, Shield } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "Courses", to: "/courses" },
  { label: "How It Works", to: "/#how-it-works" },
  { label: "Live Sessions", to: "/live-sessions" },
  { label: "About", to: "/#about" },
  { label: "FAQ", to: "/#faq" },
  { label: "Contact", to: "/contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => { await logout(); navigate("/"); };
  const isActive = (to) => (to === "/" ? location.pathname === "/" : location.pathname === to);

  return (
    <header className="fixed top-0 inset-x-0 z-50 glass" data-testid="navbar">
      <nav className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group" data-testid="brand-logo">
          <div className="w-9 h-9 rounded-lg bg-emerald flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-navy" strokeWidth={2.5} />
          </div>
          <span className="font-heading text-lg font-extrabold tracking-tight">TradeAcademy</span>
        </Link>

        <div className="hidden lg:flex items-center gap-7">
          {navLinks.map((l) => (
            <Link key={l.label} to={l.to} data-testid={`nav-${l.label.toLowerCase().replace(/\s/g, "-")}`}
              className={`text-sm transition-colors hover:text-emerald ${isActive(l.to) ? "text-emerald" : "text-slate-300"}`}>
              {l.label}
            </Link>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-3">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button data-testid="user-menu-trigger" className="flex items-center gap-2 px-3 py-2 rounded-full border border-white/10 hover:border-emerald/40 transition-colors">
                  <div className="w-7 h-7 rounded-full bg-emerald/20 text-emerald flex items-center justify-center text-sm font-semibold">
                    {user.name?.[0]?.toUpperCase()}
                  </div>
                  <span className="text-sm text-slate-200 max-w-[120px] truncate">{user.name}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-navy-2 border-white/10 text-slate-200">
                <DropdownMenuItem onClick={() => navigate("/dashboard")} data-testid="menu-dashboard"><LayoutDashboard className="w-4 h-4 mr-2" />Dashboard</DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/profile")} data-testid="menu-profile"><User className="w-4 h-4 mr-2" />Profile</DropdownMenuItem>
                {user.role === "admin" && <DropdownMenuItem onClick={() => navigate("/admin")} data-testid="menu-admin"><Shield className="w-4 h-4 mr-2" />Admin Panel</DropdownMenuItem>}
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem onClick={handleLogout} data-testid="menu-logout"><LogOut className="w-4 h-4 mr-2" />Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link to="/login" data-testid="nav-login" className="text-sm text-slate-200 hover:text-emerald transition-colors px-3 py-2">Login</Link>
              <Link to="/register" data-testid="nav-register" className="btn-emerald text-sm font-semibold px-4 py-2 rounded-full">Create Free Account</Link>
            </>
          )}
        </div>

        <button className="lg:hidden text-slate-200" onClick={() => setOpen(!open)} data-testid="mobile-menu-toggle" aria-label="Toggle menu">
          {open ? <X /> : <Menu />}
        </button>
      </nav>

      {open && (
        <div className="lg:hidden bg-navy border-t border-white/10 px-5 py-4 space-y-1" data-testid="mobile-menu">
          {navLinks.map((l) => (
            <Link key={l.label} to={l.to} onClick={() => setOpen(false)} className="block py-2 text-slate-300 hover:text-emerald">{l.label}</Link>
          ))}
          <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
            {user ? (
              <>
                <Link to="/dashboard" onClick={() => setOpen(false)} className="py-2 text-slate-200">Dashboard</Link>
                <Link to="/profile" onClick={() => setOpen(false)} className="py-2 text-slate-200">Profile</Link>
                {user.role === "admin" && <Link to="/admin" onClick={() => setOpen(false)} className="py-2 text-slate-200">Admin Panel</Link>}
                <button onClick={() => { setOpen(false); handleLogout(); }} className="text-left py-2 text-slate-200">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setOpen(false)} className="py-2 text-slate-200">Login</Link>
                <Link to="/register" onClick={() => setOpen(false)} className="btn-emerald text-center font-semibold px-4 py-2 rounded-full">Create Free Account</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
