import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import AuthShell from "@/pages/AuthShell";

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
    <AuthShell title="Student Login" subtitle="Log in with the credentials issued by your administrator."
      footer={<>Don't have an account? <span className="text-slate-300">Contact your administrator to get access.</span></>}>
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
        <button type="submit" disabled={loading} data-testid="login-submit"
          className="btn-emerald w-full font-semibold py-3 rounded-full disabled:opacity-60">
          {loading ? "Logging in…" : "Login"}
        </button>
      </form>
      <p className="mt-5 text-xs text-slate-500 text-center">
        Accounts are created by an administrator. Once you log in, you can change your password from your profile.
      </p>
    </AuthShell>
  );
}
