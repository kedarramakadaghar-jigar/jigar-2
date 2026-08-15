import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import AuthShell, { googleLogin } from "@/pages/AuthShell";
import { GoogleBtn } from "@/pages/GoogleBtn";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { if (user) navigate("/dashboard", { replace: true }); }, [user, navigate]);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Login failed");
    } finally { setLoading(false); }
  };

  return (
    <AuthShell title="Welcome back" subtitle="Log in to continue learning."
      footer={<>Don't have an account? <Link to="/register" className="text-emerald hover:underline">Create Free Account</Link></>}>
      <form onSubmit={submit} className="space-y-4" data-testid="login-form">
        <div>
          <Label className="text-slate-300">Email Address</Label>
          <Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
            data-testid="login-email" className="mt-1.5 bg-navy-2 border-white/10" placeholder="you@example.com" />
        </div>
        <div>
          <Label className="text-slate-300">Password</Label>
          <Input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
            data-testid="login-password" className="mt-1.5 bg-navy-2 border-white/10" placeholder="••••••••" />
        </div>
        <div className="text-right">
          <Link to="/forgot-password" className="text-xs text-slate-400 hover:text-emerald">Forgot password?</Link>
        </div>
        <button type="submit" disabled={loading} data-testid="login-submit"
          className="btn-emerald w-full font-semibold py-3 rounded-full disabled:opacity-60">
          {loading ? "Logging in…" : "Login"}
        </button>
      </form>
      <Divider />
      <GoogleBtn onClick={googleLogin} label="Continue with Google" />
    </AuthShell>
  );
}

function Divider() {
  return (
    <div className="flex items-center gap-3 my-5">
      <div className="flex-1 h-px bg-white/10" />
      <span className="text-xs text-slate-500">or</span>
      <div className="flex-1 h-px bg-white/10" />
    </div>
  );
}
