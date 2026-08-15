import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import AuthShell, { googleLogin } from "@/pages/AuthShell";
import { GoogleBtn } from "@/pages/GoogleBtn";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm_password: "" });
  const [loading, setLoading] = useState(false);
  const { register, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { if (user) navigate("/dashboard", { replace: true }); }, [user, navigate]);

  const submit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm_password) return toast.error("Passwords do not match");
    setLoading(true);
    try {
      await register(form);
      toast.success("Account created — welcome!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Registration failed");
    } finally { setLoading(false); }
  };

  return (
    <AuthShell title="Create your free account" subtitle="It's free — start learning in seconds."
      footer={<>Already have an account? <Link to="/login" className="text-emerald hover:underline">Login</Link></>}>
      <form onSubmit={submit} className="space-y-4" data-testid="register-form">
        <div>
          <Label className="text-slate-300">Full Name</Label>
          <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            data-testid="register-name" className="mt-1.5 bg-navy-2 border-white/10" placeholder="Your name" />
        </div>
        <div>
          <Label className="text-slate-300">Email Address</Label>
          <Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
            data-testid="register-email" className="mt-1.5 bg-navy-2 border-white/10" placeholder="you@example.com" />
        </div>
        <div>
          <Label className="text-slate-300">Password</Label>
          <Input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
            data-testid="register-password" className="mt-1.5 bg-navy-2 border-white/10" placeholder="At least 6 characters" />
        </div>
        <div>
          <Label className="text-slate-300">Confirm Password</Label>
          <Input type="password" required value={form.confirm_password} onChange={(e) => setForm({ ...form, confirm_password: e.target.value })}
            data-testid="register-confirm" className="mt-1.5 bg-navy-2 border-white/10" placeholder="Re-enter password" />
        </div>
        <button type="submit" disabled={loading} data-testid="register-submit"
          className="btn-emerald w-full font-semibold py-3 rounded-full disabled:opacity-60">
          {loading ? "Creating…" : "Create Free Account"}
        </button>
      </form>
      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px bg-white/10" /><span className="text-xs text-slate-500">or</span><div className="flex-1 h-px bg-white/10" />
      </div>
      <GoogleBtn onClick={googleLogin} label="Sign up with Google" />
    </AuthShell>
  );
}
